import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { FRAMEWORK_PROMPTS } from "./prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const InputSchema = z.object({
  framework: z.string().max(100),
  heroProfile: z.object({
    name: z.string().max(200),
    brand: z.string().max(200),
    niche: z.string().max(500),
    audience: z.string().max(500),
    originStory: z.string().max(5000),
    transformation: z.string().max(1000),
    mechanism: z.string().max(1000),
    enemy: z.string().max(500),
    bigPromise: z.string().max(1000),
    proof: z.string().max(2000),
  }),
});

// Rate limiter: 20 requests per hour per authenticated user
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 3600_000;
const RATE_LIMIT_MAX = 20;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const attempts = (rateLimitMap.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (attempts.length >= RATE_LIMIT_MAX) { rateLimitMap.set(key, attempts); return true; }
  attempts.push(now); rateLimitMap.set(key, attempts); return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, a] of rateLimitMap.entries()) {
    const r = a.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (r.length === 0) rateLimitMap.delete(k); else rateLimitMap.set(k, r);
  }
}, RATE_LIMIT_WINDOW_MS);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check — require authenticated user
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub as string;

    // Rate limit per user
    if (isRateLimited(userId)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input
    let input: z.infer<typeof InputSchema>;
    try {
      input = InputSchema.parse(await req.json());
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid input", details: e instanceof z.ZodError ? e.errors : "Validation failed" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { framework, heroProfile } = input;

    const frameworkPrompt = FRAMEWORK_PROMPTS[framework];
    if (!frameworkPrompt) {
      return new Response(
        JSON.stringify({ error: `Unknown framework: ${framework}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[expert-scripts] LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const heroContext = `
## HERO PROFILE (The Attractive Character / Expert)
- **Name:** ${heroProfile.name}
- **Brand/Company:** ${heroProfile.brand}
- **Niche/Market:** ${heroProfile.niche}
- **Target Audience:** ${heroProfile.audience}
- **Origin Story (short):** ${heroProfile.originStory}
- **Core Transformation:** ${heroProfile.transformation}
- **Unique Mechanism:** ${heroProfile.mechanism}
- **Enemy/Villain:** ${heroProfile.enemy}
- **Big Promise:** ${heroProfile.bigPromise}
- **Proof/Results:** ${heroProfile.proof}
`;

    const systemPrompt = `${frameworkPrompt}

${heroContext}

IMPORTANT RULES:
- Write in Russell Brunson's energetic, story-driven voice
- Every piece of copy must be specific to THIS hero and THEIR audience
- Use concrete numbers, names, and details — no generic placeholders
- Make it emotionally compelling AND logically sound
- Format with markdown headers, bold text, and clear sections
- Write copy that is READY TO USE — not templates with [brackets]
- Incorporate neuroscience language (serotonin, dopamine, brain rewiring) where relevant to the brand
- Reference the Harvard Grant Study or other research if it fits the niche
- Follow the EXACT book structure Russell teaches — do not improvise or skip steps`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate the complete "${framework}" script for this expert. Make it specific, compelling, and ready to use in their funnels. Follow Russell Brunson's exact methodology from Expert Secrets.`,
            },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits needed. Please add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("expert-scripts error:", e);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
