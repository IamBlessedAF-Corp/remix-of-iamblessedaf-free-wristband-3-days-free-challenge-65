import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get or create wallet
  let { data: wallet } = await supabase
    .from("bc_wallets")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!wallet) {
    const { data: newWallet } = await supabase
      .from("bc_wallets")
      .insert({ user_id: user.id, balance: 0, lifetime_earned: 0 })
      .select()
      .single();
    wallet = newWallet;
  }

  if (!wallet) {
    return new Response(
      JSON.stringify({ error: "Could not create wallet" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const lastBonus = wallet.last_login_bonus_at;

  if (lastBonus === today) {
    return new Response(
      JSON.stringify({
        already_claimed: true,
        balance: wallet.balance,
        streak: wallet.streak_days,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Streak check
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const isConsecutive = lastBonus === yesterdayStr;
  const newStreak = isConsecutive ? wallet.streak_days + 1 : 1;

  // Escalating bonus: Day 1: 10, Day 2: 15, Day 3: 20, ... Day 7+: 50
  const bonusAmount = Math.min(newStreak * 5 + 5, 50);
  const newBalance = wallet.balance + bonusAmount;
  const newLifetime = wallet.lifetime_earned + bonusAmount;

  await supabase
    .from("bc_wallets")
    .update({
      balance: newBalance,
      lifetime_earned: newLifetime,
      streak_days: newStreak,
      last_login_bonus_at: today,
    })
    .eq("id", wallet.id);

  await supabase.from("bc_transactions").insert({
    user_id: user.id,
    wallet_id: wallet.id,
    type: "earn",
    amount: bonusAmount,
    reason: "daily_login",
    balance_after: newBalance,
    metadata: { streak: newStreak, day: today },
  });

  return new Response(
    JSON.stringify({
      already_claimed: false,
      bonus: bonusAmount,
      balance: newBalance,
      streak: newStreak,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
