import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_SECONDS = 60; // 1 OTP per minute per phone

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
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { action, phone, code, purpose = "login", userId } = await req.json();

    if (!phone || typeof phone !== "string") {
      return new Response(
        JSON.stringify({ error: "Phone number required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize phone
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    let formattedPhone: string;
    if (cleanPhone.startsWith("+")) formattedPhone = cleanPhone;
    else if (cleanPhone.length === 10) formattedPhone = `+1${cleanPhone}`;
    else if (cleanPhone.length === 11 && cleanPhone.startsWith("1")) formattedPhone = `+${cleanPhone}`;
    else formattedPhone = `+${cleanPhone}`;

    if (action === "send") {
      // ── SEND OTP ──

      // Rate limit: check last OTP sent
      const { data: recent } = await supabase
        .from("otp_codes")
        .select("created_at")
        .eq("phone", formattedPhone)
        .eq("purpose", purpose)
        .is("verified_at", null)
        .order("created_at", { ascending: false })
        .limit(1);

      if (recent && recent.length > 0) {
        const lastSent = new Date(recent[0].created_at).getTime();
        const elapsed = (Date.now() - lastSent) / 1000;
        if (elapsed < RATE_LIMIT_SECONDS) {
          return new Response(
            JSON.stringify({
              error: `Please wait ${Math.ceil(RATE_LIMIT_SECONDS - elapsed)} seconds before requesting a new code.`,
            }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const otpCode = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

      // Store OTP
      await supabase.from("otp_codes").insert({
        phone: formattedPhone,
        code: otpCode,
        purpose,
        user_id: userId || null,
        expires_at: expiresAt,
      });

      // Send via sms-router (OTP lane)
      const routerRes = await fetch(`${supabaseUrl}/functions/v1/sms-router`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          to: formattedPhone,
          trafficType: "otp",
          templateKey: purpose === "password_reset" ? "otp-password-reset" : "otp-login",
          variables: { code: otpCode },
        }),
      });

      const routerData = await routerRes.json();

      if (!routerRes.ok) {
        console.error("[send-otp] Router error:", routerData);
        return new Response(
          JSON.stringify({ error: "Failed to send verification code" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Verification code sent",
          expiresInMinutes: OTP_EXPIRY_MINUTES,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "verify") {
      // ── VERIFY OTP ──
      if (!code || typeof code !== "string") {
        return new Response(
          JSON.stringify({ error: "Verification code required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find the latest active OTP for this phone/purpose
      const { data: otpRecord } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("phone", formattedPhone)
        .eq("purpose", purpose)
        .is("verified_at", null)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!otpRecord) {
        return new Response(
          JSON.stringify({ error: "No active verification code found. Please request a new one." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check max attempts
      if (otpRecord.attempts >= MAX_ATTEMPTS) {
        return new Response(
          JSON.stringify({ error: "Too many attempts. Please request a new code." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Increment attempts
      await supabase
        .from("otp_codes")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      // Verify code
      if (otpRecord.code !== code.trim()) {
        return new Response(
          JSON.stringify({
            error: "Invalid code",
            attemptsRemaining: MAX_ATTEMPTS - otpRecord.attempts - 1,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark as verified
      await supabase
        .from("otp_codes")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          phone: formattedPhone,
          purpose,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'send' or 'verify'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[send-otp] error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
