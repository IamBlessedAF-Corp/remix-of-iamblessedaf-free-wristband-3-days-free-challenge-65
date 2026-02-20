import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CreateSchema = z.object({
  action: z.literal("create"),
  destination_url: z.string().url().max(2048),
  title: z.string().max(200).optional(),
  campaign: z.string().max(100).optional(),
  source_page: z.string().max(100).optional(),
  created_by: z.string().uuid().nullable().optional(),
  custom_code: z.string().regex(/^[a-zA-Z0-9_-]+$/).min(3).max(50).optional(),
  metadata: z.record(z.any()).optional(),
  /** UTM params to auto-inject into the destination URL for CTA attribution */
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

const ResolveSchema = z.object({
  action: z.literal("resolve"),
  code: z.string().min(1).max(50),
});

const TrackSchema = z.object({
  action: z.literal("track"),
  link_id: z.string().uuid(),
  referrer: z.string().max(2048).optional(),
  user_agent: z.string().max(1000).optional(),
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
});

const AnalyticsSchema = z.object({
  action: z.literal("analytics"),
  link_id: z.string().uuid(),
  days: z.number().int().min(1).max(365).optional().default(30),
});

const BatchCreateSchema = z.object({
  action: z.literal("batch_create"),
  links: z.array(z.object({
    destination_url: z.string().url().max(2048),
    title: z.string().max(200).optional(),
    campaign: z.string().max(100).optional(),
    source_page: z.string().max(100).optional(),
    created_by: z.string().uuid().optional(),
    metadata: z.record(z.any()).optional(),
  })).min(1).max(50),
});

const ActionSchema = z.object({ action: z.enum(["create", "resolve", "track", "analytics", "batch_create"]) });

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

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + "blessed-salt-2024");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function requireAdmin(req: Request, supabase: any): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", claimsData.claims.sub).eq("role", "admin").maybeSingle();
  if (!roleData) {
    return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return null; // authorized
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // First parse just the action to route
    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let actionResult: any;
    try {
      actionResult = ActionSchema.parse(body);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid action. Use: create, resolve, track, analytics, batch_create" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { action } = actionResult;

    // ────────────────────────────────────────────
    // ACTION: CREATE SHORT LINK (any authenticated user)
    // ────────────────────────────────────────────
    if (action === "create") {
      // Allow any authenticated user (or anon for public CTAs) to create short links

      let input: z.infer<typeof CreateSchema>;
      try { input = CreateSchema.parse(body); } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid input", details: e instanceof z.ZodError ? e.errors : "Validation failed" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let shortCode = input.custom_code || generateCode();
      let attempts = 0;
      while (attempts < 5) {
        const { data: existing } = await supabase.from("short_links").select("id").eq("short_code", shortCode).maybeSingle();
        if (!existing) break;
        shortCode = generateCode();
        attempts++;
      }

      // Inject UTM params into destination URL for CTA attribution
      let destinationUrl = input.destination_url;
      if (input.utm_source || input.utm_medium || input.utm_campaign) {
        try {
          const parsed = new URL(destinationUrl);
          if (input.utm_source && !parsed.searchParams.has("utm_source")) {
            parsed.searchParams.set("utm_source", input.utm_source);
          }
          if (input.utm_medium && !parsed.searchParams.has("utm_medium")) {
            parsed.searchParams.set("utm_medium", input.utm_medium);
          }
          if (input.utm_campaign && !parsed.searchParams.has("utm_campaign")) {
            parsed.searchParams.set("utm_campaign", input.utm_campaign);
          }
          destinationUrl = parsed.toString();
        } catch {
          // If URL parsing fails, keep original
        }
      }

      const { data, error } = await supabase.from("short_links").insert({
        short_code: shortCode,
        destination_url: destinationUrl,
        title: input.title || null,
        campaign: input.campaign || null,
        source_page: input.source_page || null,
        created_by: input.created_by || null,
        metadata: input.metadata || {},
      }).select().single();

      if (error) {
        console.error("Create short link error:", error);
        return new Response(JSON.stringify({ error: "Failed to create link" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({
        short_code: data.short_code,
        short_url: `https://iamblessedaf.com/go/${data.short_code}`,
        id: data.id,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ────────────────────────────────────────────
    // ACTION: RESOLVE (public)
    // ────────────────────────────────────────────
    if (action === "resolve") {
      let input: z.infer<typeof ResolveSchema>;
      try { input = ResolveSchema.parse(body); } catch {
        return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: link, error } = await supabase.from("short_links").select("id, destination_url, is_active, expires_at").eq("short_code", input.code).maybeSingle();
      if (error || !link) {
        return new Response(JSON.stringify({ error: "Link not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (!link.is_active) {
        return new Response(JSON.stringify({ error: "Link is deactivated" }), { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Link has expired" }), { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ destination_url: link.destination_url, link_id: link.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ────────────────────────────────────────────
    // ACTION: TRACK CLICK (public)
    // ────────────────────────────────────────────
    if (action === "track") {
      let input: z.infer<typeof TrackSchema>;
      try { input = TrackSchema.parse(body); } catch {
        return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const ua = input.user_agent || req.headers.get("user-agent") || "";
      const { device, browser, os } = parseUserAgent(ua);

      const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || "unknown";
      const ipHash = await hashIP(clientIP);

      await supabase.from("link_clicks").insert({
        link_id: input.link_id,
        referrer: input.referrer || null,
        user_agent: ua.substring(0, 500),
        ip_hash: ipHash,
        device_type: device,
        browser,
        os,
        utm_source: input.utm_source || null,
        utm_medium: input.utm_medium || null,
        utm_campaign: input.utm_campaign || null,
      });

      await supabase.rpc("increment_click_count", { p_link_id: input.link_id });

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ────────────────────────────────────────────
    // ACTION: GET ANALYTICS (requires admin)
    // ────────────────────────────────────────────
    if (action === "analytics") {
      const authErr = await requireAdmin(req, supabase);
      if (authErr) return authErr;

      let input: z.infer<typeof AnalyticsSchema>;
      try { input = AnalyticsSchema.parse(body); } catch {
        return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const { data: link } = await supabase.from("short_links").select("*").eq("id", input.link_id).single();
      const { data: clicks } = await supabase.from("link_clicks")
        .select("clicked_at, device_type, browser, os, country, utm_source, utm_medium, utm_campaign")
        .eq("link_id", input.link_id)
        .gte("clicked_at", since.toISOString())
        .order("clicked_at", { ascending: false })
        .limit(1000);

      const deviceBreakdown: Record<string, number> = {};
      const browserBreakdown: Record<string, number> = {};
      const dailyClicks: Record<string, number> = {};
      const utmSources: Record<string, number> = {};

      for (const click of clicks || []) {
        const d = click.device_type || "unknown";
        deviceBreakdown[d] = (deviceBreakdown[d] || 0) + 1;
        const b = click.browser || "unknown";
        browserBreakdown[b] = (browserBreakdown[b] || 0) + 1;
        const day = click.clicked_at.substring(0, 10);
        dailyClicks[day] = (dailyClicks[day] || 0) + 1;
        if (click.utm_source) {
          utmSources[click.utm_source] = (utmSources[click.utm_source] || 0) + 1;
        }
      }

      return new Response(JSON.stringify({
        link,
        total_clicks: link?.click_count || 0,
        period_clicks: clicks?.length || 0,
        device_breakdown: deviceBreakdown,
        browser_breakdown: browserBreakdown,
        daily_clicks: dailyClicks,
        utm_sources: utmSources,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ────────────────────────────────────────────
    // ACTION: BATCH CREATE (requires admin)
    // ────────────────────────────────────────────
    if (action === "batch_create") {
      const authErr = await requireAdmin(req, supabase);
      if (authErr) return authErr;

      let input: z.infer<typeof BatchCreateSchema>;
      try { input = BatchCreateSchema.parse(body); } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid input", details: e instanceof z.ZodError ? e.errors : "Validation failed" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const results = [];
      for (const link of input.links) {
        const shortCode = generateCode();
        const { data, error } = await supabase.from("short_links").insert({
          short_code: shortCode,
          destination_url: link.destination_url,
          title: link.title || null,
          campaign: link.campaign || null,
          source_page: link.source_page || null,
          created_by: link.created_by || null,
          metadata: link.metadata || {},
        }).select("short_code, id").single();

        if (data) {
          results.push({
            ...data,
            short_url: `https://iamblessedaf.com/go/${data.short_code}`,
            original: link.destination_url,
          });
        }
      }

      return new Response(JSON.stringify({ links: results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: create, resolve, track, analytics, batch_create" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Short link error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
