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

// IP-based rate limiter: max 10 OTP requests per hour per IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 3600_000; // 1 hour
const RATE_LIMIT_MAX_PER_IP = 10;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const attempts = (rateLimitMap.get(key) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (attempts.length >= RATE_LIMIT_MAX_PER_IP) {
    rateLimitMap.set(key, attempts);
    return true;
  }
  attempts.push(now);
  rateLimitMap.set(key, attempts);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, attempts] of rateLimitMap.entries()) {
    const recent = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) rateLimitMap.delete(key);
    else rateLimitMap.set(key, recent);
  }
}, 300_000);

// Phone validation: E.164 format, 10-15 digits
const PHONE_REGEX = /^\+[1-9]\d{9,14}$/;

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

  // IP-based rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { action, phone, code, purpose = "login", userId } = await req.json();

    if (!phone || typeof phone !== "string" || phone.length > 20) {
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

    // Validate E.164 format
    if (!PHONE_REGEX.test(formattedPhone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate purpose
    const ALLOWED_PURPOSES = ["login", "password_reset", "verification"];
    if (!ALLOWED_PURPOSES.includes(purpose)) {
      return new Response(
        JSON.stringify({ error: "Invalid purpose" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "send") {
      // Rate limit: check last OTP sent per phone
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

      await supabase.from("otp_codes").insert({
        phone: formattedPhone,
        code: otpCode,
        purpose,
        user_id: userId || null,
        expires_at: expiresAt,
      });

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

      if (!routerRes.ok) {
        const routerData = await routerRes.json().catch(() => ({}));
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
      if (!code || typeof code !== "string" || code.length > 10) {
        return new Response(
          JSON.stringify({ error: "Verification code required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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
          JSON.stringify({
            error: "Invalid code",
            attemptsRemaining: MAX_ATTEMPTS - otpRecord.attempts - 1,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

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
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
