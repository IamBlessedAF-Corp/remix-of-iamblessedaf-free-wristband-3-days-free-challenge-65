import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * send-joy-keys-emails
 * Called by pg_cron every 30 minutes.
 * Sends email milestone notifications when users unlock Joy Keys.
 *
 * Logic:
 * - Checks joy_keys_analytics for recent key_unlocked events
 *   that haven't been emailed yet (no matching joy_keys_email_log entry).
 * - Sends congratulations email via Resend with next-step CTA.
 * - Each event gets max 1 email (tracked in joy_keys_email_log).
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // ── PAUSE GUARD ──
  const { data: pauseConfig } = await supabase
    .from("campaign_config")
    .select("value")
    .eq("key", "engagement_joy_keys_emails")
    .maybeSingle();

  if (pauseConfig?.value === "paused") {
    console.log("send-joy-keys-emails: PAUSED via campaign_config — skipping");
    return new Response(
      JSON.stringify({ paused: true, reason: "Joy Keys emails disabled" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const now = new Date();
  const nowISO = now.toISOString();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
  const results = { emailsSent: 0, skipped: 0, failed: 0, errors: [] as string[] };

  try {
    // ── Fetch recent key_unlocked events (last 6h, not yet emailed) ──
    const { data: events, error: eErr } = await supabase
      .from("joy_keys_analytics")
      .select("id, user_id, event_type, key_number, created_at")
      .eq("event_type", "key_unlocked")
      .gte("created_at", sixHoursAgo)
      .order("created_at", { ascending: true })
      .limit(30);

    if (eErr) {
      console.error("Error fetching analytics events:", eErr);
      return new Response(
        JSON.stringify({ error: eErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ ...results, message: "No recent key unlocks" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const evt of events) {
      // ── Check if already emailed ──
      const { data: alreadySent } = await supabase
        .from("joy_keys_email_log")
        .select("id")
        .eq("user_id", evt.user_id)
        .eq("key_number", evt.key_number)
        .limit(1);

      if (alreadySent && alreadySent.length > 0) {
        results.skipped++;
        continue;
      }

      // ── Get user email from auth ──
      const { data: { user }, error: uErr } = await supabase.auth.admin.getUserById(evt.user_id);

      if (uErr || !user?.email) {
        results.skipped++;
        continue;
      }

      // ── Get display name ──
      const { data: participant } = await supabase
        .from("challenge_participants")
        .select("display_name")
        .eq("user_id", evt.user_id)
        .limit(1)
        .maybeSingle();

      const name = participant?.display_name || user.email.split("@")[0];

      // ── Build email content ──
      const emailContent = buildKeyEmail(name, evt.key_number);

      // ── Send via Resend ──
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Blessed AF <hello@iamblessedaf.com>",
            to: [user.email],
            subject: emailContent.subject,
            html: emailContent.html,
          }),
        });

        const resendData = await resendRes.json();

        if (resendRes.ok && resendData.id) {
          await supabase.from("joy_keys_email_log").insert({
            user_id: evt.user_id,
            key_number: evt.key_number,
            resend_id: resendData.id,
            sent_at: nowISO,
            status: "sent",
          });
          results.emailsSent++;
        } else {
          const errMsg = resendData.message || "Resend error";
          console.error(`Email failed for ${evt.user_id}:`, errMsg);
          await supabase.from("joy_keys_email_log").insert({
            user_id: evt.user_id,
            key_number: evt.key_number,
            sent_at: nowISO,
            status: "failed",
            error_message: errMsg,
          });
          results.failed++;
          results.errors.push(`${evt.user_id}: ${errMsg}`);
        }
      } catch (sendErr) {
        const errMsg = sendErr instanceof Error ? sendErr.message : "Send failed";
        console.error(`Email send error for ${evt.user_id}:`, errMsg);
        await supabase.from("joy_keys_email_log").insert({
          user_id: evt.user_id,
          key_number: evt.key_number,
          sent_at: nowISO,
          status: "failed",
          error_message: errMsg,
        });
        results.failed++;
        results.errors.push(`${evt.user_id}: ${errMsg}`);
      }
    }

    console.log(
      `Joy Keys emails complete: ${results.emailsSent} sent, ${results.skipped} skipped, ${results.failed} failed`
    );
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-joy-keys-emails error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/** Build HTML email for each key milestone */
function buildKeyEmail(
  name: string,
  keyNumber: number
): { subject: string; html: string } {
  const baseUrl = "https://iamblessedaf.com";

  const templates: Record<number, { subject: string; heading: string; body: string; cta: string; ctaUrl: string }> = {
    0: {
      subject: `🔑 Key 0 Activated — You're IN, ${name}!`,
      heading: "Challenge Activated! 🎉",
      body: `You just earned 50 Blessed Coins by activating your challenge. Your first Joy Key is unlocked!<br><br>Next step: Share your referral link or a clip to unlock Key 1 and earn 100 more coins.`,
      cta: "Share & Unlock Key 1 →",
      ctaUrl: `${baseUrl}/challenge`,
    },
    1: {
      subject: `🔑🔑 Key 1 Unlocked — Keep the momentum, ${name}!`,
      heading: "Key 1 Unlocked! 🔥",
      body: `Amazing! You earned 100 Blessed Coins for sharing. You're 50% there!<br><br>Next: Share your gratitude story to unlock Key 2 and earn 150 coins.`,
      cta: "Share Your Story →",
      ctaUrl: `${baseUrl}/challenge/story`,
    },
    2: {
      subject: `🔑🔑🔑 Key 2 Done — Almost there, ${name}!`,
      heading: "Key 2 Unlocked! 💛",
      body: `Your story is out there inspiring others. 150 coins earned!<br><br>Final stretch: Invite 3 friends to join and unlock Key 3 for FREE shipping on your wristband.`,
      cta: "Invite Friends →",
      ctaUrl: `${baseUrl}/challenge/invite`,
    },
    3: {
      subject: `🏆 ALL KEYS UNLOCKED — Master Key earned, ${name}!`,
      heading: "MASTER KEY UNLOCKED! 🏆✨",
      body: `You did it! All 4 Joy Keys complete. You earned 500 bonus Blessed Coins and unlocked <strong>FREE SHIPPING</strong> on your Neuro-Hacker Wristband!<br><br>Your total coins are ready. Claim your reward now.`,
      cta: "Claim FREE Shipping →",
      ctaUrl: `${baseUrl}/offer/wristband`,
    },
  };

  const t = templates[keyNumber] || templates[0];

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:40px 32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">${"🔑".repeat(Math.min(keyNumber + 1, 4))}</div>
          <h1 style="color:#f5c542;font-size:28px;margin:0 0 16px;">${t.heading}</h1>
          <p style="color:#e0e0e0;font-size:16px;line-height:1.6;margin:0 0 32px;">${t.body}</p>
          <a href="${t.ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#f5c542,#e6a817);color:#0a0a0a;font-weight:700;font-size:18px;padding:16px 40px;border-radius:50px;text-decoration:none;">
            ${t.cta}
          </a>
        </td></tr>
        <tr><td style="padding:24px 32px;background:#111;text-align:center;">
          <p style="color:#666;font-size:12px;margin:0;">
            Blessed AF · <a href="${baseUrl}" style="color:#f5c542;text-decoration:none;">iamblessedaf.com</a>
            <br>You're receiving this because you joined the 3-Day Challenge.
            <br><a href="${baseUrl}/unsubscribe-digest" style="color:#666;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  return { subject: t.subject, html };
}
