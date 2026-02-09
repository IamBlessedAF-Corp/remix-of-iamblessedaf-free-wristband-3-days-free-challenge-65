import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function generateCode(len = 7): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) {
    result += chars[arr[i] % chars.length];
  }
  return result;
}

function parseUserAgent(ua: string) {
  let device = "desktop";
  let browser = "unknown";
  let os = "unknown";

  if (/mobile|android|iphone|ipad/i.test(ua)) device = "mobile";
  if (/tablet|ipad/i.test(ua)) device = "tablet";

  if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/edg/i.test(ua)) browser = "Edge";

  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

// Simple IP hash for privacy
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + "blessed-salt-2024");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json();
    const { action } = body;

    // ────────────────────────────────────────────
    // ACTION: CREATE SHORT LINK
    // ────────────────────────────────────────────
    if (action === "create") {
      const {
        destination_url,
        title,
        campaign,
        source_page,
        created_by,
        custom_code,
        metadata,
      } = body;

      if (!destination_url) {
        return new Response(
          JSON.stringify({ error: "destination_url is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Use custom code or generate one
      let shortCode = custom_code || generateCode();

      // Ensure uniqueness
      let attempts = 0;
      while (attempts < 5) {
        const { data: existing } = await supabase
          .from("short_links")
          .select("id")
          .eq("short_code", shortCode)
          .maybeSingle();

        if (!existing) break;
        shortCode = generateCode();
        attempts++;
      }

      const { data, error } = await supabase
        .from("short_links")
        .insert({
          short_code: shortCode,
          destination_url,
          title: title || null,
          campaign: campaign || null,
          source_page: source_page || null,
          created_by: created_by || null,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error("Create short link error:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          short_code: data.short_code,
          short_url: `https://iamblessedaf.com/go/${data.short_code}`,
          id: data.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ────────────────────────────────────────────
    // ACTION: RESOLVE (get destination for a code)
    // ────────────────────────────────────────────
    if (action === "resolve") {
      const { code } = body;

      if (!code) {
        return new Response(
          JSON.stringify({ error: "code is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: link, error } = await supabase
        .from("short_links")
        .select("id, destination_url, is_active, expires_at")
        .eq("short_code", code)
        .maybeSingle();

      if (error || !link) {
        return new Response(
          JSON.stringify({ error: "Link not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!link.is_active) {
        return new Response(
          JSON.stringify({ error: "Link is deactivated" }),
          { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: "Link has expired" }),
          { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ destination_url: link.destination_url, link_id: link.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ────────────────────────────────────────────
    // ACTION: TRACK CLICK
    // ────────────────────────────────────────────
    if (action === "track") {
      const { link_id, referrer, user_agent, utm_source, utm_medium, utm_campaign } = body;

      if (!link_id) {
        return new Response(
          JSON.stringify({ error: "link_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ua = user_agent || req.headers.get("user-agent") || "";
      const { device, browser, os } = parseUserAgent(ua);

      // Hash IP for privacy
      const clientIP =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("cf-connecting-ip") ||
        "unknown";
      const ipHash = await hashIP(clientIP);

      // Insert click event
      await supabase.from("link_clicks").insert({
        link_id,
        referrer: referrer || null,
        user_agent: ua.substring(0, 500),
        ip_hash: ipHash,
        device_type: device,
        browser,
        os,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
      });

      // Increment click count
      await supabase.rpc("increment_click_count", { p_link_id: link_id });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ────────────────────────────────────────────
    // ACTION: GET ANALYTICS (admin only)
    // ────────────────────────────────────────────
    if (action === "analytics") {
      const { link_id, days = 30 } = body;

      if (!link_id) {
        return new Response(
          JSON.stringify({ error: "link_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const since = new Date();
      since.setDate(since.getDate() - days);

      // Get link info
      const { data: link } = await supabase
        .from("short_links")
        .select("*")
        .eq("id", link_id)
        .single();

      // Get clicks
      const { data: clicks } = await supabase
        .from("link_clicks")
        .select("clicked_at, device_type, browser, os, country, utm_source, utm_medium, utm_campaign")
        .eq("link_id", link_id)
        .gte("clicked_at", since.toISOString())
        .order("clicked_at", { ascending: false })
        .limit(1000);

      // Aggregate stats
      const deviceBreakdown: Record<string, number> = {};
      const browserBreakdown: Record<string, number> = {};
      const dailyClicks: Record<string, number> = {};
      const utmSources: Record<string, number> = {};

      for (const click of clicks || []) {
        // Device
        const d = click.device_type || "unknown";
        deviceBreakdown[d] = (deviceBreakdown[d] || 0) + 1;

        // Browser
        const b = click.browser || "unknown";
        browserBreakdown[b] = (browserBreakdown[b] || 0) + 1;

        // Daily
        const day = click.clicked_at.substring(0, 10);
        dailyClicks[day] = (dailyClicks[day] || 0) + 1;

        // UTM
        if (click.utm_source) {
          utmSources[click.utm_source] = (utmSources[click.utm_source] || 0) + 1;
        }
      }

      return new Response(
        JSON.stringify({
          link,
          total_clicks: link?.click_count || 0,
          period_clicks: clicks?.length || 0,
          device_breakdown: deviceBreakdown,
          browser_breakdown: browserBreakdown,
          daily_clicks: dailyClicks,
          utm_sources: utmSources,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ────────────────────────────────────────────
    // ACTION: BATCH CREATE (for bulk link generation)
    // ────────────────────────────────────────────
    if (action === "batch_create") {
      const { links } = body;

      if (!Array.isArray(links) || links.length === 0) {
        return new Response(
          JSON.stringify({ error: "links array is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const results = [];
      for (const link of links.slice(0, 50)) {
        const shortCode = generateCode();
        const { data, error } = await supabase
          .from("short_links")
          .insert({
            short_code: shortCode,
            destination_url: link.destination_url,
            title: link.title || null,
            campaign: link.campaign || null,
            source_page: link.source_page || null,
            created_by: link.created_by || null,
            metadata: link.metadata || {},
          })
          .select("short_code, id")
          .single();

        if (data) {
          results.push({
            ...data,
            short_url: `https://iamblessedaf.com/go/${data.short_code}`,
            original: link.destination_url,
          });
        }
      }

      return new Response(
        JSON.stringify({ links: results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: create, resolve, track, analytics, batch_create" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Short link error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
