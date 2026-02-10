import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FRAMEWORK_PROMPTS } from "./prompts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { framework, heroProfile } = await req.json();

    if (!framework || !heroProfile) {
      return new Response(
        JSON.stringify({ error: "Missing framework or heroProfile" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const frameworkPrompt = FRAMEWORK_PROMPTS[framework];
    if (!frameworkPrompt) {
      return new Response(
        JSON.stringify({ error: `Unknown framework: ${framework}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
