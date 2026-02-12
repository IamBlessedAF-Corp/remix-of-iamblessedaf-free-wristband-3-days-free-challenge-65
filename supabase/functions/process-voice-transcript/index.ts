import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.2";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { transcript, sectionId, existingProfile } = await req.json();

    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return new Response(JSON.stringify({ error: "No transcript provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format transcript for AI
    const transcriptText = transcript
      .map((t: { role: string; text: string }) => `${t.role === "user" ? "User" : "Agent"}: ${t.text}`)
      .join("\n");

    const existingProfileText = existingProfile
      ? Object.entries(existingProfile)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")
      : "No existing profile";

    // Step 1: Extract hero profile updates from transcript
    const extractionResponse = await fetch(
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
            {
              role: "system",
              content: `You are an expert at extracting structured marketing profile data from voice interview transcripts.
              
Given a conversation transcript between a voice agent and a user, extract any Hero Profile information mentioned.
The Hero Profile has these fields: name, brand, niche, audience, originStory, transformation, mechanism, enemy, bigPromise, proof.

EXISTING PROFILE:
${existingProfileText}

RULES:
- Only update fields where the user clearly provided new or better information
- Keep existing values for fields not discussed in the transcript
- Be faithful to what the user actually said — don't embellish
- Combine relevant user statements into coherent profile entries
- Return ONLY the JSON object with the updated fields`,
            },
            {
              role: "user",
              content: `Extract hero profile updates from this voice interview transcript:\n\n${transcriptText}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "update_hero_profile",
                description: "Update the hero profile with extracted information from the voice interview.",
                parameters: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Expert's name" },
                    brand: { type: "string", description: "Brand/company name" },
                    niche: { type: "string", description: "Niche/market" },
                    audience: { type: "string", description: "Target audience" },
                    originStory: { type: "string", description: "Origin story" },
                    transformation: { type: "string", description: "Core transformation delivered" },
                    mechanism: { type: "string", description: "Unique mechanism/vehicle" },
                    enemy: { type: "string", description: "Enemy/broken system" },
                    bigPromise: { type: "string", description: "Big promise/future-based cause" },
                    proof: { type: "string", description: "Best proof/results" },
                    updatedFields: {
                      type: "array",
                      items: { type: "string" },
                      description: "List of field names that were actually updated based on the transcript",
                    },
                  },
                  required: ["updatedFields"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "update_hero_profile" } },
        }),
      }
    );

    if (!extractionResponse.ok) {
      const errText = await extractionResponse.text();
      console.error("Profile extraction error:", extractionResponse.status, errText);

      if (extractionResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (extractionResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits needed. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Failed to extract profile data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extractionData = await extractionResponse.json();
    let profileUpdates: Record<string, any> = {};
    let updatedFields: string[] = [];

    try {
      const toolCall = extractionData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        updatedFields = parsed.updatedFields || [];
        // Only include fields that were actually updated
        for (const field of updatedFields) {
          if (parsed[field] && parsed[field].trim()) {
            profileUpdates[field] = parsed[field];
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse profile extraction:", e);
    }

    // Merge with existing profile
    const mergedProfile = { ...existingProfile, ...profileUpdates };

    // Step 2: Generate a summary of what was captured
    const result = {
      profileUpdates,
      updatedFields,
      mergedProfile,
      transcriptSummary: `Processed ${transcript.length} messages from voice interview. Updated ${updatedFields.length} profile fields.`,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-voice-transcript error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
