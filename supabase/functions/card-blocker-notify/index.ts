import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OWNER_EMAIL = "joecury@gmail.com";
const OWNER_WHATSAPP = "+13052401905";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { card_id, card_title, blocker_details } = await req.json();

    if (!card_id || !card_title) throw new Error("card_id and card_title required");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const boardUrl = `${SUPABASE_URL.replace("supabase.co", "lovable.app").replace(/^https:\/\/[^.]+/, "https://funnel-architect-ai-30.lovable.app")}/board`;

    // 1) Send Email via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const resend = new Resend(RESEND_API_KEY);
      try {
        await resend.emails.send({
          from: "Board AI <onboarding@resend.dev>",
          to: [OWNER_EMAIL],
          subject: `🚧 Blocker on card: ${card_title}`,
          replyTo: OWNER_EMAIL,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#f59e0b;">🚧 AI Assistant Hit a Blocker</h2>
              <p><strong>Card:</strong> ${card_title}</p>
              <p><strong>Card ID:</strong> <code>${card_id}</code></p>
              <hr/>
              <h3>Blocker Details:</h3>
              <pre style="background:#f3f4f6;padding:16px;border-radius:8px;white-space:pre-wrap;font-size:13px;">${blocker_details}</pre>
              <hr/>
              <p>💡 <strong>Reply to this email</strong> with the missing information or instructions. Your response will be used to unblock this card.</p>
              <p><a href="${boardUrl}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">Open Board</a></p>
            </div>
          `,
        });
        console.log("Blocker email sent to", OWNER_EMAIL);
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    } else {
      console.warn("RESEND_API_KEY not set — skipping email notification");
    }

    // 2) Send WhatsApp via Twilio
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (accountSid && authToken && fromNumber) {
      const whatsappMsg = `🚧 *Board AI Blocker*\n\n📋 Card: ${card_title}\n\n${blocker_details.slice(0, 500)}\n\n💡 Reply to the email with the missing info to unblock.`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const credentials = btoa(`${accountSid}:${authToken}`);

      try {
        const waBody = new URLSearchParams({
          To: `whatsapp:${OWNER_WHATSAPP}`,
          From: `whatsapp:${fromNumber}`,
          Body: whatsappMsg,
        });

        const waRes = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: waBody.toString(),
        });

        if (waRes.ok) {
          console.log("WhatsApp blocker notification sent");
        } else {
          const waErr = await waRes.json();
          console.error("WhatsApp failed:", waErr.message);
          
          // Fallback to SMS
          const smsBody = new URLSearchParams({
            To: OWNER_WHATSAPP,
            From: fromNumber,
            Body: `🚧 Board AI Blocker on "${card_title}". Check email for details and reply to unblock.`,
          });

          await fetch(twilioUrl, {
            method: "POST",
            headers: {
              Authorization: `Basic ${credentials}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: smsBody.toString(),
          }).catch(() => {});
        }
      } catch (err) {
        console.error("WhatsApp/SMS notification failed:", err);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("card-blocker-notify error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
