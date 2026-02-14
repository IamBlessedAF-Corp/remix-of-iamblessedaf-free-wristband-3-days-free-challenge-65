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
    const { email, firstName } = await req.json();
    if (!email) throw new Error("Email is required");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    const name = firstName || "Future Neuro-Hacker";

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
          The world's first <strong>zero-battery smart wearable neuro-hack</strong> is almost here.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://iamblessedaf.com/Reserve-a-SMART-wristband" style="background: #dc2626; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 16px; display: inline-block;">
            🚀 Reserve with $11 — Lock 77% OFF
          </a>
        </div>
        <p style="font-size: 13px; color: #888; text-align: center;">
          Stay blessed 🙏<br/>
          — The IamBlessedAF Team
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
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

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      throw new Error("Failed to send email");
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
