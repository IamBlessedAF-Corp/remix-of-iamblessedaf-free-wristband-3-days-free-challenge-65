import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_SECONDS = 60;

function generateOtp(): string {
  const digits = "0123456789";
  let code = "";
  const array = new Uint8Array(OTP_LENGTH);
  crypto.getRandomValues(array);
  for (let i = 0; i < OTP_LENGTH; i++) {
    code += digits[array[i] % 10];
  }
  return code;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { action, email, code, purpose = "email_verify" } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (action === "send") {
      // Rate limit
      const { data: recent } = await supabase
        .from("otp_codes")
        .select("created_at")
        .eq("phone", normalizedEmail)
        .eq("purpose", purpose)
        .is("verified_at", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (recent && recent.length > 0) {
        const elapsed = (Date.now() - new Date(recent[0].created_at).getTime()) / 1000;
        if (elapsed < RATE_LIMIT_SECONDS) {
          return new Response(
            JSON.stringify({ error: `Espera ${Math.ceil(RATE_LIMIT_SECONDS - elapsed)} segundos antes de pedir otro código.` }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const otpCode = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

      await supabase.from("otp_codes").insert({
        phone: normalizedEmail, // reusing phone column for email
        code: otpCode,
        purpose,
        expires_at: expiresAt,
      });

      // Send via Resend
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "I am Blessed AF <noreply@iamblessedaf.com>",
          to: [normalizedEmail],
          subject: `Your verification code: ${otpCode}`,
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:440px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h2 style="color:#ffffff;font-size:20px;margin:0 0 4px;">🙏 I am Blessed AF</h2>
      <p style="color:#888;font-size:13px;margin:0;">Email Verification</p>
    </div>
    <div style="background:#111;border:1px solid #222;border-radius:16px;padding:32px;text-align:center;">
      <p style="color:#ccc;font-size:14px;margin:0 0 20px;">Enter this code to verify your email:</p>
      <div style="background:#0a0a0a;border:2px solid #333;border-radius:12px;padding:20px;margin:0 0 20px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#fff;font-family:monospace;">${otpCode}</span>
      </div>
      <p style="color:#666;font-size:12px;margin:0;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
    </div>
    <p style="text-align:center;color:#444;font-size:11px;margin-top:24px;">
      If you didn't request this code, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`,
        }),
      });

      if (!resendRes.ok) {
        const err = await resendRes.text();
        console.error("[send-email-otp] Resend error:", err);
        return new Response(
          JSON.stringify({ error: "Failed to send verification email" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Verification code sent", expiresInMinutes: OTP_EXPIRY_MINUTES }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      if (!code || typeof code !== "string") {
        return new Response(
          JSON.stringify({ error: "Verification code required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: otpRecord } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("phone", normalizedEmail)
        .eq("purpose", purpose)
        .is("verified_at", null)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!otpRecord) {
        return new Response(
          JSON.stringify({ error: "No active code found. Please request a new one." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (otpRecord.attempts >= MAX_ATTEMPTS) {
        return new Response(
          JSON.stringify({ error: "Too many attempts. Please request a new code." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("otp_codes")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      if (otpRecord.code !== code.trim()) {
        return new Response(
          JSON.stringify({ error: "Invalid code", attemptsRemaining: MAX_ATTEMPTS - otpRecord.attempts - 1 }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("otp_codes")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ success: true, verified: true, email: normalizedEmail }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'send' or 'verify'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[send-email-otp] error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
