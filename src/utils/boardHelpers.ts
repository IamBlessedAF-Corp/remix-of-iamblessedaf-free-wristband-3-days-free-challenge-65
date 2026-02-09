import type { BoardCard, BoardColumn } from "@/hooks/useBoard";

/**
 * Shared delegation score computation.
 * Used by CardDetailModal, CreateCardModal, and the DB trigger.
 */
export function computeDelegationScore(scores: {
  vs_score?: number;
  cc_score?: number;
  hu_score?: number;
  r_score?: number;
  ad_score?: number;
}): number {
  const vs = scores.vs_score || 0;
  const cc = scores.cc_score || 0;
  const hu = scores.hu_score || 0;
  const r = scores.r_score || 0;
  const ad = scores.ad_score || 0;
  const maxDenom = 5 * (0.3 + 0.25 + 0.3 + 0.15 + 0.3);
  return ((vs * 0.3 + cc * 0.25 + (5 - hu) * 0.3 + r * 0.15 + ad * 0.3) * 100) / maxDenom;
}

/**
 * Delegation score badge styling helper.
 */
export function getDelegationBadge(score: number) {
  if (score >= 70) return { text: `D:${score.toFixed(0)}`, className: "bg-green-500/20 text-green-400 border-green-500/40" };
  if (score >= 40) return { text: `D:${score.toFixed(0)}`, className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" };
  return { text: `D:${score.toFixed(0)}`, className: "bg-red-500/20 text-red-400 border-red-500/40" };
}

/** Map column position to next-action label & description */
export function getNextAction(
  card: BoardCard,
  columns?: BoardColumn[]
): { label: string; description: string; nextColumnId: string | null } | null {
  if (!columns || columns.length === 0) return null;

  const currentCol = columns.find((c) => c.id === card.column_id);
  if (!currentCol) return null;

  const sorted = [...columns].sort((a, b) => a.position - b.position);
  const currentIdx = sorted.findIndex((c) => c.id === currentCol.id);
  const nextCol = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  // Don't show action for Done, 3 Outcomes, Ideas, or Review columns (manual moves only)
  if (
    currentCol.name.includes("✅ Done") ||
    currentCol.name.includes("3 Outcomes") ||
    currentCol.name.includes("Ideas") ||
    currentCol.name.includes("👀 Review")
  ) return null;

  const nextColumnId = nextCol?.id ?? null;
  const name = currentCol.name;

  // Use a compact lookup table instead of many if/else
  const actionMap: Array<[string, string, string]> = [
    ["Ideas", "→ Send to Backlog", "Queue for prioritization"],
    ["Backlog", "→ Clarify Scope", "Define requirements & acceptance criteria"],
    ["Clarification", "→ Start Today", "Move to today's work queue"],
    ["Today", "→ Begin Work", "Start active execution"],
    ["Work in Progress", "→ Security Check", "Submit for security review"],
    ["Security", "→ Validate", "Push to validation queue"],
    ["Credentials", "→ Validate", "Credentials ready — validate"],
    ["Validation (New)", "→ System Validate", "Run automated checks"],
    ["Validation (System)", "→ Review", "Submit for final review"],
    ["Errors", "→ Back to Review", "Fix applied — re-review"],
    ["👀 Review", "→ Mark Done ✅", "Approve and complete"],
    ["3 Outcomes", "→ Ideate", "Break into actionable ideas"],
  ];

  for (const [keyword, label, description] of actionMap) {
    if (name.includes(keyword)) return { label, description, nextColumnId };
  }

  return { label: "→ Advance", description: "Move to next stage", nextColumnId };
}
