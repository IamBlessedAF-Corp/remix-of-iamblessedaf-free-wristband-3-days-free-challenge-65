import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** In-memory rate limiter: max 30 error reports per minute per IP */
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (attempts.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, attempts);
    return true;
  }
  attempts.push(now);
  rateLimitMap.set(ip, attempts);
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, attempts] of rateLimitMap.entries()) {
    const recent = attempts.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, recent);
  }
}, RATE_LIMIT_WINDOW_MS);

/**
 * Generate a fingerprint from error message + component to group duplicates.
 */
function generateFingerprint(message: string, component?: string): string {
  const base = `${message}::${component || "unknown"}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many error reports" }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const {
      source = "frontend",
      level = "error",
      message,
      stack,
      component,
      page_url,
      user_agent,
      session_id,
      metadata,
    } = body as {
      source?: string;
      level?: string;
      message?: string;
      stack?: string;
      component?: string;
      page_url?: string;
      user_agent?: string;
      session_id?: string;
      metadata?: Record<string, unknown>;
    };

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'message' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const fingerprint = generateFingerprint(message, component);

    // Check for user auth (optional)
    let userId: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabase.auth.getUser(token);
        if (data.user) userId = data.user.id;
      } catch {
        // Non-blocking: anonymous error capture is fine
      }
    }

    const { error: insertError } = await supabase.from("error_events").insert({
      source: source.slice(0, 50),
      level: ["error", "warn", "fatal"].includes(level) ? level : "error",
      message: message.slice(0, 2000),
      stack: stack?.slice(0, 5000) || null,
      component: component?.slice(0, 200) || null,
      page_url: page_url?.slice(0, 500) || null,
      user_agent: user_agent?.slice(0, 500) || null,
      user_id: userId || null,
      session_id: session_id?.slice(0, 100) || null,
      metadata: metadata || {},
      fingerprint,
    });

    if (insertError) {
      console.error("[ingest-error] DB insert failed:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send webhook alert for fatal errors
    if (level === "fatal") {
      const webhookUrl = Deno.env.get("ERROR_WEBHOOK_URL");
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: `🚨 FATAL ERROR\n**${source}**: ${message.slice(0, 500)}\nComponent: ${component || "—"}\nPage: ${page_url || "—"}`,
            }),
          });
        } catch (e) {
          console.error("[ingest-error] Webhook failed:", e);
        }
      }

      // Also send email alert via Resend
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendKey}`,
            },
            body: JSON.stringify({
              from: "alerts@iamblessedaf.com",
              to: ["admin@iamblessedaf.com"],
              subject: `🚨 Fatal Error: ${message.slice(0, 80)}`,
              html: `<h2>Fatal Error Detected</h2>
<p><strong>Source:</strong> ${source}</p>
<p><strong>Message:</strong> ${message.slice(0, 500)}</p>
<p><strong>Component:</strong> ${component || "—"}</p>
<p><strong>Page:</strong> ${page_url || "—"}</p>
<pre>${stack?.slice(0, 2000) || "No stack trace"}</pre>`,
            }),
          });
        } catch (e) {
          console.error("[ingest-error] Email alert failed:", e);
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, fingerprint }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
