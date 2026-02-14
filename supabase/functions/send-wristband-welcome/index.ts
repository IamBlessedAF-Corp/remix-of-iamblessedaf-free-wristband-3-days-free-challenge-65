import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, phone } = await req.json();
    if (!email) throw new Error("Email is required");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    const name = firstName || "Future Neuro-Hacker";

    // Send welcome email
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; font-weight: 900; margin: 0;">You're on the waitlist! 🧠🔥</h1>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Hey <strong>${name}</strong>,
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          You just secured your spot on the <strong>mPFC Neuro-Hacker Wristband SMART</strong> early access list.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Here's what happens next:
        </p>
        <ul style="font-size: 15px; line-height: 1.8; color: #333;">
          <li>📬 You'll get <strong>early-bird updates</strong> before anyone else</li>
          <li>🚀 First access to the <strong>Kickstarter launch</strong> (77% OFF)</li>
          <li>🧪 Behind-the-scenes neuroscience drops</li>
          <li>🎁 Exclusive waitlist-only bonuses</li>
        </ul>
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          <strong>While you wait</strong> — we want to send you a <strong>FREE prototype wristband</strong> (without the NFC) so you can start your neuro-hacker journey today! 🎁
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://iamblessedaf.com/FREE-neuro-hacker-wristband" style="background: #dc2626; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 16px; display: inline-block;">
            🎁 Claim Your FREE Wristband NOW
          </a>
        </div>
        <div style="text-align: center; margin: 16px 0;">
          <a href="https://iamblessedaf.com/Reserve-a-SMART-wristband" style="background: #333; color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 14px; display: inline-block;">
            🚀 Or Reserve SMART with $11 — Lock 77% OFF
          </a>
        </div>
        <p style="font-size: 13px; color: #888; text-align: center;">
          Stay blessed 🙏<br/>
          — The IamBlessedAF Team
        </p>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "IamBlessedAF <hello@iamblessedaf.com>",
        to: [email],
        subject: `${name}, you're on the mPFC SMART Wristband waitlist 🧠🚀`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error("Resend error:", err);
    }

    // Send SMS if phone provided
    if (phone) {
      try {
        const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
        const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
        const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID_TRANSACTIONAL");

        if (twilioSid && twilioToken && messagingServiceSid) {
          const smsBody = `🧠 Hey ${name}! You're on the mPFC SMART Wristband waitlist!\n\n🎁 While you wait — claim your FREE prototype wristband (no NFC) here:\nhttps://iamblessedaf.com/FREE-neuro-hacker-wristband\n\nWe'll text you the moment our Kickstarter goes LIVE so you can lock 77% OFF!\n\n— IamBlessedAF`;

          const formData = new URLSearchParams();
          formData.append("MessagingServiceSid", messagingServiceSid);
          formData.append("To", phone);
          formData.append("Body", smsBody);

          const smsRes = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
              },
              body: formData.toString(),
            }
          );

          if (!smsRes.ok) {
            const smsErr = await smsRes.text();
            console.error("Twilio SMS error:", smsErr);
          } else {
            console.log("SMS sent to", phone);
          }
        }
      } catch (smsError) {
        console.error("SMS send failed:", smsError);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
