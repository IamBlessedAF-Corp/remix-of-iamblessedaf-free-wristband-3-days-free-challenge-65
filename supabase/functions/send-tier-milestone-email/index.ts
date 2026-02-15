import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TierMilestoneRequest {
  email: string;
  name?: string;
  tier: string;
  credit: number;
  wristbands: number;
}

const TIER_CONFIG: Record<string, { emoji: string; color: string; perks: string[] }> = {
  silver: {
    emoji: "🥈",
    color: "#94a3b8",
    perks: [
      "Increased marketing credit: $8,250",
      "Priority support access",
      "Silver Ambassador badge on your profile",
    ],
  },
  gold: {
    emoji: "🥇",
    color: "#f59e0b",
    perks: [
      "Massive marketing credit: $33,000",
      "Higher commission rates unlocked",
      "Gold Ambassador badge + leaderboard highlight",
      "Access to advanced analytics tools",
    ],
  },
  diamond: {
    emoji: "💎",
    color: "#a855f7",
    perks: [
      "Maximum marketing credit: $330,000",
      "50% commission rate on all referrals",
      "Diamond Ambassador exclusive portal",
      "White-label funnels + AI content assistant",
      "Private mastermind group access",
      "Priority lead routing from HQ",
    ],
  },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, tier, credit, wristbands }: TierMilestoneRequest = await req.json();

    if (!email || !tier) {
      throw new Error("Email and tier are required");
    }

    const config = TIER_CONFIG[tier];
    if (!config) {
      throw new Error(`Unknown tier: ${tier}`);
    }

    const greeting = name ? `${name}` : "Ambassador";
    const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

    const perksHtml = config.perks
      .map((p) => `<li style="margin:0 0 8px 0;padding-left:4px;">${p}</li>`)
      .join("");

    const emailResponse = await resend.emails.send({
      from: "IamBlessedAF <noreply@iamblessedaf.com>",
      to: [email],
      subject: `${config.emoji} You've unlocked ${tierName} Ambassador!`,
      headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin:0; padding:0; background:#0a0a0a; color:#e5e5e5; font-family:Georgia,'Times New Roman',serif; line-height:1.7; }
    .container { max-width:520px; margin:0 auto; padding:48px 24px; }
    .badge { text-align:center; margin-bottom:32px; }
    .badge-icon { font-size:64px; display:block; margin-bottom:12px; }
    .badge-title { font-size:28px; font-weight:bold; color:${config.color}; margin:0; }
    .badge-subtitle { font-size:14px; color:#888; margin:4px 0 0 0; }
    p { margin:0 0 20px 0; font-size:16px; }
    .highlight { color:#fff; font-weight:bold; }
    .credit-box { background:#111; border:1px solid ${config.color}33; border-radius:12px; padding:24px; text-align:center; margin:24px 0; }
    .credit-amount { font-size:36px; font-weight:bold; color:${config.color}; margin:0; }
    .credit-label { font-size:12px; text-transform:uppercase; letter-spacing:2px; color:#888; margin-top:4px; }
    .perks { background:#111; border:1px solid #222; border-radius:12px; padding:24px; margin:24px 0; }
    .perks-title { font-size:14px; text-transform:uppercase; letter-spacing:2px; color:${config.color}; margin:0 0 16px 0; font-weight:bold; }
    .perks ul { margin:0; padding-left:20px; color:#ccc; font-size:15px; }
    .cta { display:inline-block; background:${config.color}; color:#0a0a0a; font-weight:bold; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:16px; margin-top:24px; }
    .signature { margin-top:40px; padding-top:24px; border-top:1px solid #222; color:#888; font-size:14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">
      <span class="badge-icon">${config.emoji}</span>
      <h1 class="badge-title">${tierName} Ambassador</h1>
      <p class="badge-subtitle">Unlocked by distributing ${wristbands.toLocaleString()} wristbands</p>
    </div>

    <p>Congratulations, <span class="highlight">${greeting}</span>!</p>

    <p>You've just reached <span class="highlight">${tierName} Ambassador</span> status — and that's not something that happens by accident. It's proof that you're building something real.</p>

    <div class="credit-box">
      <p class="credit-amount">$${credit.toLocaleString()}</p>
      <p class="credit-label">Marketing Credit Unlocked</p>
    </div>

    <div class="perks">
      <p class="perks-title">Your New Perks</p>
      <ul>${perksHtml}</ul>
    </div>

    <p>Your upgraded tools and credit are already active in your portal. Log in to see everything.</p>

    <div style="text-align:center;">
      <a href="https://funnel-architect-ai-30.lovable.app/affiliate-dashboard" class="cta">Open My Portal →</a>
    </div>

    <div class="signature">
      — The IamBlessedAF Team<br/>
      <span style="font-size:12px;">You're receiving this because you reached a milestone in the Gratitude Affiliate Program.</span>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log("Tier milestone email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending tier milestone email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
