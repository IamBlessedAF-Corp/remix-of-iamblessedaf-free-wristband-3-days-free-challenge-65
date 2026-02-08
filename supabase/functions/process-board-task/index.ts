import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { runSixSigmaChecks, formatSixSigmaLog } from "./six-sigma.ts";

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

    const { card_id, source_column_id, mode = "execute" } = await req.json();

    // ---- Fetch project documentation card for context ----
    const docsCard = await getOrCreateDocsCard(supabase);

    // ---- Pick the card ----
    let card: any;

    if (card_id) {
      const { data, error } = await supabase
        .from("board_cards")
        .select("*")
        .eq("id", card_id)
        .single();
      if (error || !data) throw new Error("Card not found");
      card = data;
    } else if (source_column_id) {
      const { data, error } = await supabase
        .from("board_cards")
        .select("*")
        .eq("column_id", source_column_id)
        .neq("id", docsCard.id) // Never process the docs card itself
        .order("position", { ascending: true })
        .limit(1)
        .single();
      if (error || !data) {
        return json({ done: true, message: "No more cards in column" });
      }
      card = data;
    } else {
      throw new Error("Provide card_id or source_column_id");
    }

    // Skip the docs card if somehow selected
    if (card.id === docsCard.id) {
      return json({ done: false, processed_card_id: card.id, skipped: true, card_title: card.title });
    }

    const timestamp = new Date().toISOString();

    // ---- Route to the right mode ----
    if (mode === "clarify") {
      return await handleClarify(supabase, card, docsCard, LOVABLE_API_KEY, timestamp, source_column_id);
    } else if (mode === "validate") {
      return await handleValidate(supabase, card, docsCard, LOVABLE_API_KEY, timestamp, source_column_id);
    } else if (mode === "sixsigma") {
      return await handleSixSigma(supabase, card, docsCard, timestamp, source_column_id);
    } else {
      return await handleExecute(supabase, card, docsCard, LOVABLE_API_KEY, timestamp, source_column_id);
    }
  } catch (e) {
    console.error("process-board-task error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

// ===================== MODE: CLARIFY =====================
async function handleClarify(
  supabase: any, card: any, docsCard: any,
  apiKey: string, timestamp: string, sourceColumnId: string
) {
  const projectContext = docsCard.description || "No project documentation yet.";

  const systemPrompt = `You are a senior project manager and technical lead. You will receive:
1. A PROJECT CONTEXT describing the overall system
2. A TASK CARD with a title and description

Your job:
- Determine if this task is RELEVANT to the project. If it clearly doesn't belong (wrong project, unrelated technology, nonsensical), respond with: {"relevant": false, "reason": "..."}
- If RELEVANT, generate a comprehensive MASTER PROMPT that a developer AI can use to implement this task. The master prompt should:
  - Be specific and actionable
  - Include acceptance criteria
  - List dependencies and files likely affected
  - Include testing steps
  - Warn about potential breaking changes
  - Be formatted in markdown

Respond with JSON: {"relevant": true, "master_prompt": "...", "summary": "one-line summary"}
or {"relevant": false, "reason": "..."}`;

  const aiContent = await callAI(apiKey, systemPrompt, `## PROJECT CONTEXT:\n${projectContext}\n\n## TASK CARD:\nTitle: ${card.title}\nDescription: ${card.description || "No description"}\nLabels: ${(card.labels || []).join(", ") || "None"}\nPriority: ${card.priority || "medium"}`);

  let parsed: any;
  try {
    // Extract JSON from potential markdown code blocks
    const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || aiContent.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent);
  } catch {
    parsed = { relevant: true, master_prompt: aiContent, summary: "AI generated prompt (raw)" };
  }

  const logEntry = `[${timestamp}] CLARIFY:\n${parsed.relevant ? "✅ Relevant — master prompt generated" : `❌ Not relevant: ${parsed.reason}`}`;

  if (parsed.relevant) {
    const nextColumnId = await getNextColumnId(supabase, card.column_id);
    const updates: Record<string, any> = {
      master_prompt: parsed.master_prompt,
      summary: parsed.summary || parsed.master_prompt?.slice(0, 200),
      logs: appendLog(card.logs, logEntry),
    };
    if (nextColumnId) updates.column_id = nextColumnId;

    await supabase.from("board_cards").update(updates).eq("id", card.id);

    // Log to docs card
    await appendDocsLog(supabase, docsCard, `[${timestamp}] CLARIFIED: "${card.title}" → prompt generated, moved forward`);

    return json({
      done: false, processed_card_id: card.id, card_title: card.title,
      mode: "clarify", relevant: true,
      ai_summary_preview: (parsed.summary || "").slice(0, 200),
      next_source_column_id: sourceColumnId || card.column_id,
    });
  } else {
    // Leave in place, mark as not relevant
    await supabase.from("board_cards").update({
      summary: `⚠️ Not relevant: ${parsed.reason}`,
      logs: appendLog(card.logs, logEntry),
      labels: [...(card.labels || []).filter((l: string) => l !== "not-relevant"), "not-relevant"],
    }).eq("id", card.id);

    await appendDocsLog(supabase, docsCard, `[${timestamp}] SKIPPED (not relevant): "${card.title}" — ${parsed.reason}`);

    return json({
      done: false, processed_card_id: card.id, card_title: card.title,
      mode: "clarify", relevant: false, reason: parsed.reason,
      next_source_column_id: sourceColumnId || card.column_id,
    });
  }
}

// ===================== MODE: EXECUTE =====================
async function handleExecute(
  supabase: any, card: any, docsCard: any,
  apiKey: string, timestamp: string, sourceColumnId: string
) {
  // Enforce WIP limit before moving card into WIP
  const wipOk = await checkWipLimit(supabase);
  if (!wipOk) {
    return json({
      done: true, message: "WIP limit reached — finish current card before processing more",
      wip_blocked: true,
    });
  }
  if (!card.master_prompt) {
    const nextColumnId = await getNextColumnId(supabase, card.column_id);
    if (nextColumnId) {
      await supabase.from("board_cards")
        .update({ column_id: nextColumnId, summary: "(Skipped — no master prompt)" })
        .eq("id", card.id);
    }
    return json({
      done: false, processed_card_id: card.id, card_title: card.title,
      skipped: true, mode: "execute",
      next_source_column_id: sourceColumnId || card.column_id,
    });
  }

  // Save pre-execution snapshot for rollback
  const snapshot = {
    column_id: card.column_id,
    summary: card.summary,
    logs: card.logs,
    master_prompt: card.master_prompt,
  };

  const systemPrompt = `You are a senior full-stack developer. You receive a task card with a master prompt.

CRITICAL RULES:
1. Analyze the task and provide a COMPLETE execution plan with specific code changes
2. List ALL files that need to be modified or created
3. Identify ALL dependencies required
4. Provide step-by-step implementation
5. Include TESTING steps — both unit tests for this feature and integration tests to verify it doesn't break existing functionality
6. Include a ROLLBACK plan in case something goes wrong
7. Format in markdown with clear sections

Sections required:
## Implementation Plan
## Files Modified
## Dependencies
## Testing (Individual)
## Integration Testing
## Rollback Plan`;

  const aiContent = await callAI(apiKey, systemPrompt,
    `## Task: ${card.title}\n\n## Description:\n${card.description || "No description"}\n\n## Master Prompt:\n${card.master_prompt}\n\n## Labels: ${(card.labels || []).join(", ") || "None"}\n## Priority: ${card.priority || "medium"}\n\n## Project Context:\n${(docsCard.description || "").slice(0, 2000)}`
  );

  const nextColumnId = await getNextColumnId(supabase, card.column_id);
  const logEntry = `[${timestamp}] EXECUTE:\n${aiContent}`;

  const updates: Record<string, any> = {
    summary: aiContent.slice(0, 2000),
    logs: appendLog(card.logs, logEntry),
    // Store snapshot in logs for rollback
  };
  if (nextColumnId) updates.column_id = nextColumnId;

  await supabase.from("board_cards").update(updates).eq("id", card.id);

  // Log to docs card with rollback info
  await appendDocsLog(supabase, docsCard,
    `[${timestamp}] EXECUTED: "${card.title}" | Moved to next column | Snapshot: col=${snapshot.column_id}`
  );

  return json({
    done: false, processed_card_id: card.id, card_title: card.title,
    mode: "execute",
    ai_summary_preview: aiContent.slice(0, 200),
    moved_to_column: nextColumnId,
    next_source_column_id: sourceColumnId || card.column_id,
  });
}

// ===================== MODE: VALIDATE =====================
async function handleValidate(
  supabase: any, card: any, docsCard: any,
  apiKey: string, timestamp: string, sourceColumnId: string
) {
  if (!card.summary || card.summary.startsWith("(Skipped")) {
    const nextColumnId = await getNextColumnId(supabase, card.column_id);
    if (nextColumnId) {
      await supabase.from("board_cards")
        .update({ column_id: nextColumnId })
        .eq("id", card.id);
    }
    return json({
      done: false, processed_card_id: card.id, card_title: card.title,
      skipped: true, mode: "validate",
      next_source_column_id: sourceColumnId || card.column_id,
    });
  }

  const systemPrompt = `You are a QA engineer and system architect. Review this executed task and its output.

Your job:
1. Check if the execution plan is COMPLETE and SAFE
2. Identify any MISSING DEPENDENCIES
3. Check for potential BREAKING CHANGES to the existing system
4. Verify TESTING coverage is adequate
5. Assess if this can be safely integrated

Respond with JSON:
{
  "status": "pass" | "warn" | "fail",
  "issues": ["list of issues found"],
  "dependencies_ok": true/false,
  "breaking_changes": ["list of potential breaking changes"],
  "safe_to_integrate": true/false,
  "recommendation": "brief recommendation"
}`;

  const aiContent = await callAI(apiKey, systemPrompt,
    `## Task: ${card.title}\n\n## Master Prompt:\n${card.master_prompt || "None"}\n\n## Execution Output:\n${card.summary}\n\n## Project Context:\n${(docsCard.description || "").slice(0, 2000)}`
  );

  let parsed: any;
  try {
    const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || aiContent.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent);
  } catch {
    parsed = { status: "warn", recommendation: aiContent, safe_to_integrate: true, issues: [], breaking_changes: [] };
  }

  const logEntry = `[${timestamp}] VALIDATE: ${parsed.status?.toUpperCase()} — ${parsed.recommendation || "No recommendation"}`;

  const nextColumnId = parsed.status === "fail"
    ? await getErrorColumnId(supabase) // Send to Errors column if failed
    : await getNextColumnId(supabase, card.column_id);

  const statusLabel = parsed.status === "pass" ? "validated" : parsed.status === "warn" ? "validated-warn" : "validation-failed";

  await supabase.from("board_cards").update({
    summary: `[${parsed.status?.toUpperCase()}] ${parsed.recommendation || ""}\n\n${card.summary || ""}`.slice(0, 2000),
    logs: appendLog(card.logs, logEntry),
    labels: [...(card.labels || []).filter((l: string) => !l.startsWith("validat")), statusLabel],
    ...(nextColumnId ? { column_id: nextColumnId } : {}),
  }).eq("id", card.id);

  await appendDocsLog(supabase, docsCard,
    `[${timestamp}] VALIDATED: "${card.title}" → ${parsed.status} | Safe: ${parsed.safe_to_integrate} | Issues: ${(parsed.issues || []).length}`
  );

  return json({
    done: false, processed_card_id: card.id, card_title: card.title,
    mode: "validate", validation_status: parsed.status,
    safe_to_integrate: parsed.safe_to_integrate,
    issues_count: (parsed.issues || []).length,
    next_source_column_id: sourceColumnId || card.column_id,
  });
}

// ===================== MODE: SIX SIGMA =====================
async function handleSixSigma(
  supabase: any, card: any, docsCard: any,
  timestamp: string, sourceColumnId: string
) {
  const result = runSixSigmaChecks(card);
  const sixSigmaLog = formatSixSigmaLog(result);
  const logEntry = `[${timestamp}] SIX SIGMA VERIFICATION:\n${sixSigmaLog}`;

  if (result.passed) {
    // Move to next column (toward Review)
    const nextColumnId = await getNextColumnId(supabase, card.column_id);
    await supabase.from("board_cards").update({
      logs: appendLog(card.logs, logEntry),
      labels: [
        ...(card.labels || []).filter((l: string) => !l.startsWith("sixsigma")),
        `sixsigma-${result.score}`,
        "sixsigma-passed",
      ],
      ...(nextColumnId ? { column_id: nextColumnId } : {}),
    }).eq("id", card.id);

    await appendDocsLog(supabase, docsCard,
      `[${timestamp}] 🔬 SIX SIGMA PASSED: "${card.title}" — Score: ${result.score}% — Cleared for deployment`
    );

    return json({
      done: false, processed_card_id: card.id, card_title: card.title,
      mode: "sixsigma", passed: true, score: result.score,
      checks_passed: result.checks.filter((c: any) => c.passed).length,
      checks_total: result.checks.length,
      next_source_column_id: sourceColumnId || card.column_id,
    });
  } else {
    // Block — send to Errors column
    const errorColumnId = await getErrorColumnId(supabase);
    await supabase.from("board_cards").update({
      logs: appendLog(card.logs, logEntry),
      labels: [
        ...(card.labels || []).filter((l: string) => !l.startsWith("sixsigma")),
        `sixsigma-${result.score}`,
        "sixsigma-blocked",
      ],
      summary: `🔬 SIX SIGMA BLOCKED (${result.score}%)\n\n${sixSigmaLog}\n\n---\n\n${card.summary || ""}`.slice(0, 2000),
      ...(errorColumnId ? { column_id: errorColumnId } : {}),
    }).eq("id", card.id);

    await appendDocsLog(supabase, docsCard,
      `[${timestamp}] 🔬 SIX SIGMA BLOCKED: "${card.title}" — Score: ${result.score}% — Sent to Errors`
    );

    return json({
      done: false, processed_card_id: card.id, card_title: card.title,
      mode: "sixsigma", passed: false, score: result.score,
      checks_passed: result.checks.filter((c: any) => c.passed).length,
      checks_total: result.checks.length,
      next_source_column_id: sourceColumnId || card.column_id,
    });
  }
}

// ===================== WIP LIMIT HELPER =====================
const WIP_LIMIT = 1;

async function checkWipLimit(supabase: any): Promise<boolean> {
  const { data: wipCol } = await supabase
    .from("board_columns").select("id").ilike("name", "%Work in Progress%").limit(1).single();
  if (!wipCol) return true; // No WIP column found, allow

  const { count } = await supabase
    .from("board_cards").select("id", { count: "exact", head: true })
    .eq("column_id", wipCol.id);

  return (count || 0) < WIP_LIMIT;
}

// ===================== HELPERS =====================

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callAI(apiKey: string, systemPrompt: string, userContent: string): Promise<string> {
  const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      stream: false,
    }),
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    console.error("AI gateway error:", aiResponse.status, errorText);
    if (aiResponse.status === 429) throw new Error("Rate limited — please try again later");
    if (aiResponse.status === 402) throw new Error("Payment required — add credits to your workspace");
    throw new Error(`AI gateway returned ${aiResponse.status}`);
  }

  const aiData = await aiResponse.json();
  return aiData.choices?.[0]?.message?.content || "No response from AI";
}

function appendLog(existing: string | null, entry: string): string {
  return existing ? existing + "\n\n---\n\n" + entry : entry;
}

async function getNextColumnId(supabase: any, currentColumnId: string): Promise<string | null> {
  const { data: currentCol } = await supabase
    .from("board_columns").select("position").eq("id", currentColumnId).single();
  if (!currentCol) return null;

  const { data: nextCol } = await supabase
    .from("board_columns").select("id")
    .gt("position", currentCol.position)
    .order("position", { ascending: true })
    .limit(1).single();

  return nextCol?.id || null;
}

async function getErrorColumnId(supabase: any): Promise<string | null> {
  const { data } = await supabase
    .from("board_columns").select("id").ilike("name", "%error%").limit(1).single();
  return data?.id || null;
}

/** Get or create the project documentation card in the first column */
async function getOrCreateDocsCard(supabase: any): Promise<any> {
  // Look for existing docs card by label
  const { data: existing } = await supabase
    .from("board_cards")
    .select("*")
    .contains("labels", ["project-docs"])
    .limit(1)
    .single();

  if (existing) return existing;

  // Get the first column
  const { data: firstCol } = await supabase
    .from("board_columns")
    .select("id")
    .order("position", { ascending: true })
    .limit(1)
    .single();

  if (!firstCol) throw new Error("No columns found");

  const { data: created, error } = await supabase
    .from("board_cards")
    .insert({
      column_id: firstCol.id,
      title: "📚 Project Documentation & Change Log",
      description: "Auto-generated project documentation. This card tracks all AI-processed tasks, changes, and serves as the project knowledge base for the AI pipeline.\n\n## System Overview\nThis project is a web application built with React, Vite, Tailwind CSS, and TypeScript with a Supabase backend.\n\n## Change Log\n(Auto-updated by the pipeline)",
      labels: ["project-docs", "system"],
      priority: "high",
      position: -1, // Always at top
      master_prompt: null, // Never process this card
    })
    .select()
    .single();

  if (error) throw new Error("Failed to create docs card: " + error.message);
  return created;
}

/** Append a log entry to the documentation card */
async function appendDocsLog(supabase: any, docsCard: any, entry: string) {
  const currentLogs = docsCard.logs || "";
  const updatedLogs = currentLogs ? entry + "\n" + currentLogs : entry; // Newest first
  const updatedDesc = docsCard.description || "";

  await supabase.from("board_cards").update({
    logs: updatedLogs.slice(0, 50000), // Keep under limit
    updated_at: new Date().toISOString(),
  }).eq("id", docsCard.id);

  // Update in-memory reference too
  docsCard.logs = updatedLogs;
}
