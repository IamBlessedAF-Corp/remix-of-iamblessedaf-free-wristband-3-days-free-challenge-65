import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ClipNotificationRequest {
  clip_id: string;
  user_id: string;
  action: "approved" | "bonus_milestone";
  milestone_name?: string;
  bonus_bc?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { clip_id, user_id, action, milestone_name, bonus_bc }: ClipNotificationRequest = await req.json();

    // Get user's email from creator_profiles
    const { data: profile } = await supabaseAdmin
      .from("creator_profiles")
      .select("email, display_name")
      .eq("user_id", user_id)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "No profile found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const name = profile.display_name || profile.email.split("@")[0];

    let subject: string;
    let body: string;

    if (action === "approved") {
      // Award BC for approved clip
      const BC_REWARD = 100;
      const { data: wallet } = await supabaseAdmin
        .from("bc_wallets")
        .select("id, balance, lifetime_earned")
        .eq("user_id", user_id)
        .single();

      if (wallet) {
        await supabaseAdmin
          .from("bc_wallets")
          .update({
            balance: wallet.balance + BC_REWARD,
            lifetime_earned: wallet.lifetime_earned + BC_REWARD,
          })
          .eq("id", wallet.id);

        await supabaseAdmin.from("bc_transactions").insert({
          user_id,
          wallet_id: wallet.id,
          type: "earn",
          amount: BC_REWARD,
          balance_after: wallet.balance + BC_REWARD,
          reason: `Clip approved: ${clip_id}`,
        });
      }

      // Log portal activity
      await supabaseAdmin.rpc("log_portal_activity", {
        p_event_type: "clip",
        p_display_text: `${name}'s clip was approved! +${BC_REWARD} BC 🎬`,
        p_icon_name: "film",
        p_user_id: user_id,
      });

      subject = "🎬 Your clip was approved! +100 BC";
      body = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin:0; padding:0; background:#0a0a0a; color:#e5e5e5; font-family:Georgia,'Times New Roman',serif; line-height:1.7; }
    .container { max-width:520px; margin:0 auto; padding:48px 24px; }
    p { margin:0 0 20px 0; font-size:16px; }
    .highlight { color:#ffffff; font-weight:bold; }
    .cta { display:inline-block; background:#7c3aed; color:#fff; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:bold; font-size:16px; margin-top:8px; }
    .reward { background:#1a1a2e; border:1px solid #333; border-radius:12px; padding:20px; text-align:center; margin:24px 0; }
    .reward .amount { font-size:32px; font-weight:bold; color:#7c3aed; }
    .signature { margin-top:40px; padding-top:24px; border-top:1px solid #222; color:#888; font-size:14px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Hey ${name} 🎉</p>
    <p>Your clip just got <span class="highlight">approved</span>! Keep going — every clip brings you closer to the next bonus tier.</p>
    <div class="reward">
      <p style="margin:0;font-size:14px;color:#888;">You earned</p>
      <p class="amount" style="margin:8px 0;">+100 🪙</p>
      <p style="margin:0;font-size:14px;color:#888;">Blessed Coins</p>
    </div>
    <p>Use your BC in the <span class="highlight">Rewards Store</span> to unlock exclusive perks.</p>
    <p><a href="https://iamblessedaf.com/clipper-dashboard" class="cta">View Dashboard →</a></p>
    <div class="signature">— IamBlessedAF</div>
  </div>
</body>
</html>`;
    } else {
      // Bonus milestone
      subject = `🏆 Milestone unlocked: ${milestone_name}!`;
      body = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin:0; padding:0; background:#0a0a0a; color:#e5e5e5; font-family:Georgia,'Times New Roman',serif; line-height:1.7; }
    .container { max-width:520px; margin:0 auto; padding:48px 24px; }
    p { margin:0 0 20px 0; font-size:16px; }
    .highlight { color:#ffffff; font-weight:bold; }
    .cta { display:inline-block; background:#7c3aed; color:#fff; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:bold; font-size:16px; margin-top:8px; }
    .reward { background:#1a1a2e; border:1px solid #333; border-radius:12px; padding:20px; text-align:center; margin:24px 0; }
    .reward .amount { font-size:32px; font-weight:bold; color:#7c3aed; }
    .signature { margin-top:40px; padding-top:24px; border-top:1px solid #222; color:#888; font-size:14px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Hey ${name} 🏆</p>
    <p>You just unlocked <span class="highlight">${milestone_name}</span>!</p>
    ${bonus_bc ? `
    <div class="reward">
      <p style="margin:0;font-size:14px;color:#888;">Bonus reward</p>
      <p class="amount" style="margin:8px 0;">+${bonus_bc} 🪙</p>
      <p style="margin:0;font-size:14px;color:#888;">Blessed Coins</p>
    </div>` : ""}
    <p>Keep clipping to unlock the next tier and bigger rewards.</p>
    <p><a href="https://iamblessedaf.com/clipper-dashboard" class="cta">View Dashboard →</a></p>
    <div class="signature">— IamBlessedAF</div>
  </div>
</body>
</html>`;

      // Award bonus BC if specified
      if (bonus_bc && bonus_bc > 0) {
        const { data: wallet } = await supabaseAdmin
          .from("bc_wallets")
          .select("id, balance, lifetime_earned")
          .eq("user_id", user_id)
          .single();

        if (wallet) {
          await supabaseAdmin
            .from("bc_wallets")
            .update({
              balance: wallet.balance + bonus_bc,
              lifetime_earned: wallet.lifetime_earned + bonus_bc,
            })
            .eq("id", wallet.id);

          await supabaseAdmin.from("bc_transactions").insert({
            user_id,
            wallet_id: wallet.id,
            type: "earn",
            amount: bonus_bc,
            balance_after: wallet.balance + bonus_bc,
            reason: `Milestone: ${milestone_name}`,
          });
        }

        await supabaseAdmin.rpc("log_portal_activity", {
          p_event_type: "milestone",
          p_display_text: `${name} unlocked ${milestone_name}! +${bonus_bc} BC 🏆`,
          p_icon_name: "trophy",
          p_user_id: user_id,
        });
      }
    }

    const emailResponse = await resend.emails.send({
      from: "IamBlessedAF <noreply@iamblessedaf.com>",
      to: [profile.email],
      subject,
      headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
      html: body,
    });

    console.log("Clip notification email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in clip-approved-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
