import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIERS = [
  { id: "starter", name: "Starter", wristbands: 0, credit: 3300 },
  { id: "silver", name: "Silver Ambassador", wristbands: 25, credit: 8250 },
  { id: "gold", name: "Gold Ambassador", wristbands: 100, credit: 33000 },
  { id: "diamond", name: "Diamond Ambassador", wristbands: 1000, credit: 330000 },
];

function getTierInfo(wristbands: number) {
  let idx = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (wristbands >= TIERS[i].wristbands) { idx = i; break; }
  }
  const current = TIERS[idx];
  const next = TIERS[idx + 1] || null;
  const progress = next
    ? Math.min(100, Math.round(((wristbands - current.wristbands) / (next.wristbands - current.wristbands)) * 100))
    : 100;
  return { current, next, progress, wristbandsToNext: next ? next.wristbands - wristbands : 0 };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all affiliate profiles
    const { data: profiles, error: pErr } = await supabase
      .from("creator_profiles")
      .select("user_id, display_name, email, referral_code, blessings_confirmed");

    if (pErr) throw pErr;
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let sentCount = 0;

    for (const profile of profiles) {
      try {
        // Fetch weekly stats in parallel
        const [repostsRes, walletsRes, ordersRes] = await Promise.all([
          supabase
            .from("repost_logs")
            .select("id", { count: "exact", head: true })
            .eq("user_id", profile.user_id)
            .gte("created_at", oneWeekAgo),
          supabase
            .from("bc_wallets")
            .select("balance, lifetime_earned, streak_days")
            .eq("user_id", profile.user_id)
            .maybeSingle(),
          supabase
            .from("orders")
            .select("tier")
            .eq("referral_code", profile.referral_code)
            .eq("status", "completed"),
        ]);

        const repostCount = repostsRes.count ?? 0;
        const wallet = walletsRes.data;
        const bcBalance = wallet?.balance ?? 0;
        const lifetimeBC = wallet?.lifetime_earned ?? 0;
        const streak = wallet?.streak_days ?? 0;

        // Calculate wristband count from orders
        let wristbandCount = 0;
        if (ordersRes.data) {
          for (const order of ordersRes.data) {
            const tierMap: Record<string, number> = {
              "free-wristband": 1, "wristband-22": 3, "pack-111": 3,
              "pack-444": 14, "pack-1111": 111, "pack-4444": 444,
            };
            wristbandCount += tierMap[order.tier] || 0;
          }
        }

        const tierInfo = getTierInfo(wristbandCount);
        const greeting = profile.display_name || "Ambassador";

        // Build progress bar HTML
        const progressBarHtml = tierInfo.next
          ? `<div style="margin:16px 0;">
              <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:4px;">
                <span>${tierInfo.current.name}</span>
                <span>${tierInfo.next.name}</span>
              </div>
              <div style="background:#1a1a1a;border-radius:8px;height:12px;overflow:hidden;">
                <div style="background:linear-gradient(90deg,#ef4444,#f59e0b);height:100%;width:${tierInfo.progress}%;border-radius:8px;transition:width 0.3s;"></div>
              </div>
              <p style="font-size:11px;color:#888;text-align:center;margin-top:4px;">${tierInfo.wristbandsToNext} wristbands to ${tierInfo.next.name}</p>
            </div>`
          : `<p style="text-align:center;color:#a855f7;font-weight:bold;margin:16px 0;">💎 You've reached the highest tier!</p>`;

        await resend.emails.send({
          from: "IamBlessedAF <noreply@iamblessedaf.com>",
          to: [profile.email],
          subject: `📊 Your Weekly Digest — ${repostCount} reposts, ${bcBalance} BC`,
          headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin:0; padding:0; background:#0a0a0a; color:#e5e5e5; font-family:Georgia,'Times New Roman',serif; line-height:1.7; }
    .container { max-width:520px; margin:0 auto; padding:40px 24px; }
    .stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:24px 0; }
    .stat-card { background:#111; border:1px solid #222; border-radius:12px; padding:16px; text-align:center; }
    .stat-value { font-size:28px; font-weight:bold; color:#fff; margin:0; }
    .stat-label { font-size:11px; text-transform:uppercase; letter-spacing:2px; color:#888; margin-top:2px; }
    .tier-box { background:#111; border:1px solid #222; border-radius:12px; padding:20px; margin:24px 0; }
    .cta { display:inline-block; background:#ef4444; color:#fff; font-weight:bold; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:16px; margin-top:16px; }
    .signature { margin-top:32px; padding-top:20px; border-top:1px solid #222; color:#888; font-size:13px; }
    h2 { color:#fff; margin:0 0 4px 0; font-size:20px; }
    p { margin:0 0 16px 0; font-size:15px; }
  </style>
</head>
<body>
  <div class="container">
    <p style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:3px;margin-bottom:8px;">WEEKLY DIGEST</p>
    <h2>Hey ${greeting} 👋</h2>
    <p>Here's your activity summary for the past 7 days.</p>

    <div class="stat-grid">
      <div class="stat-card">
        <p class="stat-value" style="color:#ef4444;">${repostCount}</p>
        <p class="stat-label">Reposts This Week</p>
      </div>
      <div class="stat-card">
        <p class="stat-value" style="color:#f59e0b;">${profile.blessings_confirmed}</p>
        <p class="stat-label">Total Referrals</p>
      </div>
      <div class="stat-card">
        <p class="stat-value" style="color:#22c55e;">${bcBalance.toLocaleString()}</p>
        <p class="stat-label">BC Balance</p>
      </div>
      <div class="stat-card">
        <p class="stat-value" style="color:#3b82f6;">${streak}</p>
        <p class="stat-label">Day Streak 🔥</p>
      </div>
    </div>

    <div class="tier-box">
      <p style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px 0;">Tier Progress</p>
      <p style="font-size:18px;font-weight:bold;color:#fff;margin:0;">${tierInfo.current.name} — $${tierInfo.current.credit.toLocaleString()} credit</p>
      <p style="font-size:13px;color:#aaa;margin:4px 0 0 0;">${wristbandCount} wristbands distributed</p>
      ${progressBarHtml}
    </div>

    <div style="text-align:center;">
      <a href="https://funnel-architect-ai-30.lovable.app/affiliate-dashboard" class="cta">Open My Portal →</a>
    </div>

    <div class="signature">
      — The IamBlessedAF Team<br/>
      <span style="font-size:11px;">Sent every Monday. You're receiving this as a Gratitude Affiliate.</span>
    </div>
  </div>
</body>
</html>
          `,
        });

        sentCount++;
      } catch (emailErr) {
        console.error(`Failed to send digest to ${profile.email}:`, emailErr);
      }
    }

    console.log(`Weekly digest sent to ${sentCount}/${profiles.length} affiliates`);

    return new Response(JSON.stringify({ sent: sentCount, total: profiles.length }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Weekly digest error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
