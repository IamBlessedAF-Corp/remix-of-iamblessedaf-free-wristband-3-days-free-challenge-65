import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { card_id, message, action, step_index, images } = await req.json();

    if (!card_id) throw new Error("card_id is required");

    // Fetch card context
    const { data: card, error: cardErr } = await supabase
      .from("board_cards")
      .select("*")
      .eq("id", card_id)
      .single();

    if (cardErr || !card) throw new Error("Card not found");

    // Fetch project docs card for system context
    const { data: docsCard } = await supabase
      .from("board_cards")
      .select("description, logs")
      .contains("labels", ["project-docs"])
      .limit(1)
      .single();

    const projectContext = docsCard?.description || "IamBlessedAF — gratitude-driven e-commerce funnel with viral loops, Hormozi offer stacks, and neuroscience-backed messaging.";

    // Build context-aware system prompt
    const systemPrompt = `You are an AI project assistant embedded in a Kanban card. You have full context of this card and the project.

## YOUR CARD CONTEXT
- Title: ${card.title}
- Description: ${card.description || "None"}
- Master Prompt: ${card.master_prompt || "None"}
- Stage: ${card.stage || "stage-1"}
- Priority: ${card.priority || "medium"}
- Labels: ${(card.labels || []).join(", ")}
- Delegation Score: ${card.delegation_score || 0}
- Summary: ${(card.summary || "None").slice(0, 2000)}
- Logs: ${(card.logs || "None").slice(0, 1000)}

## PROJECT CONTEXT
${projectContext.slice(0, 3000)}

## YOUR ROLE
1. If the user asks for "next steps" or "suggest", provide 3-5 specific actionable next steps for THIS card
2. If the user provides a manual prompt/instruction, generate a detailed execution plan
3. If action="suggest_next", auto-generate suggested next steps
4. Always be specific to THIS card's context
5. Format responses in markdown
6. If a task can be automated/delegated (delegation_score ≥70), say so
7. Reference the Decision Matrix scores when relevant`;

    let userMessage = message;
    let useToolCalling = false;

    if (action === "suggest_next") {
      useToolCalling = true;
      userMessage = "Based on this card's current state, master prompt, and project context, suggest 3-5 specific next steps I should take to move this card forward. Be actionable and specific. For each step, indicate if it's something the AI can auto-execute or if it needs manual human input.";
    } else if (action === "execute") {
      userMessage = `Execute this card's task. Generate a complete, detailed implementation plan based on the master prompt. Include:\n1. Step-by-step instructions\n2. Files to modify\n3. Code snippets where relevant\n4. Testing steps\n5. What to verify after implementation\n\nUser additional context: ${message || "None"}`;
    } else if (action === "execute_step") {
      userMessage = `Execute ONLY this specific step for the card:\n\n${message}\n\nProvide a complete, detailed implementation for this single step. Include specific code, commands, or actions needed. If you encounter a blocker (missing API key, credential, or need manual validation), clearly state what is blocked and what information is needed.`;
    } else if (action === "execute_all_steps") {
      userMessage = `Execute ALL of these steps sequentially for the card. Process each one carefully:\n\n${message}\n\nFor each step:\n1. Provide implementation details\n2. If blocked (missing key/credential/manual validation needed), mark it as BLOCKED with what's needed and continue to the next step\n3. Summarize what was completed and what needs manual attention\n\nIMPORTANT: Continue processing remaining steps even if one is blocked.`;
    }

    // Build user content — multimodal if images attached
    let userContent: any = userMessage;
    if (images && Array.isArray(images) && images.length > 0) {
      userContent = [
        { type: "text", text: userMessage || "Please analyze the attached image(s)." },
        ...images.map((img: { data_url: string; name: string }) => ({
          type: "image_url",
          image_url: { url: img.data_url },
        })),
      ];
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    };

    // Use tool calling for structured next steps
    if (useToolCalling) {
      body.tools = [
        {
          type: "function",
          function: {
            name: "suggest_next_steps",
            description: "Return 3-5 actionable next steps for this card",
            parameters: {
              type: "object",
              properties: {
                steps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Short step title (5-10 words)" },
                      description: { type: "string", description: "Detailed description of what to do (2-4 sentences)" },
                      can_auto_execute: { type: "boolean", description: "True if AI can execute this without human input" },
                      blocker_reason: { type: "string", description: "If can_auto_execute is false, explain what human input is needed" },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                    },
                    required: ["title", "description", "can_auto_execute", "priority"],
                    additionalProperties: false,
                  },
                },
                summary: { type: "string", description: "Brief overview of the suggested plan" },
              },
              required: ["steps", "summary"],
              additionalProperties: false,
            },
          },
        },
      ];
      body.tool_choice = { type: "function", function: { name: "suggest_next_steps" } };
      body.stream = false;
    } else {
      body.stream = false;
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errorText);
      throw new Error(`AI gateway returned ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();

    // Handle tool call response (structured steps)
    if (useToolCalling) {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          const structured = JSON.parse(toolCall.function.arguments);
          return new Response(JSON.stringify({ 
            reply: structured.summary || "Here are the suggested next steps:",
            structured_steps: structured.steps,
            card_id,
            type: "structured_steps"
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch {
          // Fall through to regular response
        }
      }
    }

    const reply = aiData.choices?.[0]?.message?.content || "No response from AI";

    // Check for blockers in execute actions — notify owner
    if ((action === "execute_step" || action === "execute_all_steps" || action === "execute") && reply.toLowerCase().includes("blocked")) {
      // Fire-and-forget notification
      try {
        const SUPABASE_URL_BASE = SUPABASE_URL.replace(/\/$/, "");
        await fetch(`${SUPABASE_URL_BASE}/functions/v1/card-blocker-notify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY") || ""}`,
          },
          body: JSON.stringify({
            card_id,
            card_title: card.title,
            blocker_details: reply.slice(0, 1000),
          }),
        }).catch(() => {});
      } catch {}
    }

    return new Response(JSON.stringify({ reply, card_id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("card-ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
