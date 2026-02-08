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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { card_id, source_column_id } = await req.json();

    // ---- 1. Pick the card ----
    let card: any;

    if (card_id) {
      // Explicit card
      const { data, error } = await supabase
        .from("board_cards")
        .select("*")
        .eq("id", card_id)
        .single();
      if (error || !data) throw new Error("Card not found");
      card = data;
    } else if (source_column_id) {
      // Pick the next card in the given column (by position asc)
      const { data, error } = await supabase
        .from("board_cards")
        .select("*")
        .eq("column_id", source_column_id)
        .order("position", { ascending: true })
        .limit(1)
        .single();
      if (error || !data) {
        return new Response(
          JSON.stringify({ done: true, message: "No more cards in column" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      card = data;
    } else {
      throw new Error("Provide card_id or source_column_id");
    }

    if (!card.master_prompt) {
      // Skip cards without a prompt — move to next column
      const nextColumnId = await getNextColumnId(supabase, card.column_id);
      if (nextColumnId) {
        await supabase
          .from("board_cards")
          .update({ column_id: nextColumnId, summary: "(Skipped — no master prompt)" })
          .eq("id", card.id);
      }
      return new Response(
        JSON.stringify({
          done: false,
          processed_card_id: card.id,
          skipped: true,
          next_source_column_id: source_column_id || card.column_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---- 2. Call AI with the master prompt ----
    const systemPrompt = `You are a senior full-stack developer and project manager. You receive a task card with instructions. Analyze the task, break it down into clear actionable steps, identify potential issues, and provide a comprehensive execution plan. Be specific and technical. Format your response with clear sections using markdown.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `## Task: ${card.title}\n\n## Description:\n${card.description || "No description"}\n\n## Master Prompt / Instructions:\n${card.master_prompt}\n\n## Labels: ${(card.labels || []).join(", ") || "None"}\n## Priority: ${card.priority || "medium"}`,
          },
        ],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited — please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required — add credits to your workspace" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway returned ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "No response from AI";

    // ---- 3. Update card with AI output ----
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] AI Execution:\n${aiContent}`;
    const existingLogs = card.logs ? card.logs + "\n\n---\n\n" + logEntry : logEntry;

    // Move card to the next column
    const nextColumnId = await getNextColumnId(supabase, card.column_id);

    const updates: Record<string, any> = {
      summary: aiContent.slice(0, 2000),
      logs: existingLogs,
    };
    if (nextColumnId) {
      updates.column_id = nextColumnId;
    }

    await supabase.from("board_cards").update(updates).eq("id", card.id);

    // ---- 4. Return result + signal for next card ----
    return new Response(
      JSON.stringify({
        done: false,
        processed_card_id: card.id,
        card_title: card.title,
        ai_summary_preview: aiContent.slice(0, 200),
        moved_to_column: nextColumnId,
        next_source_column_id: source_column_id || card.column_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("process-board-task error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/** Get the next column ID based on position order */
async function getNextColumnId(supabase: any, currentColumnId: string): Promise<string | null> {
  // Get current column position
  const { data: currentCol } = await supabase
    .from("board_columns")
    .select("position")
    .eq("id", currentColumnId)
    .single();

  if (!currentCol) return null;

  // Find the next column by position
  const { data: nextCol } = await supabase
    .from("board_columns")
    .select("id")
    .gt("position", currentCol.position)
    .order("position", { ascending: true })
    .limit(1)
    .single();

  return nextCol?.id || null;
}
