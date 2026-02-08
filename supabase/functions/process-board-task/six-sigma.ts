/**
 * Six Sigma (DMAIC) Verification Protocol
 * Applied to each card before deployment to ensure quality gates are met.
 */

export interface SixSigmaResult {
  passed: boolean;
  score: number; // 0-100
  checks: SixSigmaCheck[];
  summary: string;
}

export interface SixSigmaCheck {
  phase: "define" | "measure" | "analyze" | "improve" | "control";
  name: string;
  passed: boolean;
  details: string;
}

/** Run DMAIC verification on a card before deployment */
export function runSixSigmaChecks(card: any): SixSigmaResult {
  const checks: SixSigmaCheck[] = [];

  // ===== DEFINE =====
  checks.push({
    phase: "define",
    name: "Clear title & description",
    passed: !!(card.title && card.title.length > 5 && card.description && card.description.length > 20),
    details: card.title && card.description
      ? "Title and description are defined"
      : "Missing or insufficient title/description",
  });

  checks.push({
    phase: "define",
    name: "Master prompt exists",
    passed: !!(card.master_prompt && card.master_prompt.length > 50),
    details: card.master_prompt ? "Master prompt is detailed" : "No master prompt — task scope undefined",
  });

  checks.push({
    phase: "define",
    name: "Priority assigned",
    passed: !!(card.priority && card.priority !== "medium"),
    details: card.priority ? `Priority: ${card.priority}` : "Default priority — not explicitly evaluated",
  });

  // ===== MEASURE =====
  checks.push({
    phase: "measure",
    name: "Execution output exists",
    passed: !!(card.summary && card.summary.length > 50 && !card.summary.startsWith("(Skipped")),
    details: card.summary ? "Execution output recorded" : "No execution output — cannot measure impact",
  });

  checks.push({
    phase: "measure",
    name: "Development logs present",
    passed: !!(card.logs && card.logs.length > 30),
    details: card.logs ? "Logs captured" : "No development logs — traceability gap",
  });

  // ===== ANALYZE =====
  checks.push({
    phase: "analyze",
    name: "No error labels",
    passed: !(card.labels || []).some((l: string) =>
      l.includes("error") || l.includes("fail") || l.includes("not-relevant")
    ),
    details: (card.labels || []).some((l: string) => l.includes("error") || l.includes("fail"))
      ? "Card has error/failure labels — root cause analysis needed"
      : "No error labels detected",
  });

  checks.push({
    phase: "analyze",
    name: "Validation passed",
    passed: (card.labels || []).some((l: string) => l === "validated" || l === "validated-warn"),
    details: (card.labels || []).includes("validated")
      ? "Validation passed"
      : (card.labels || []).includes("validated-warn")
        ? "Validated with warnings — review recommended"
        : "Not yet validated — analysis incomplete",
  });

  // ===== IMPROVE =====
  checks.push({
    phase: "improve",
    name: "Implementation plan includes testing",
    passed: !!(card.summary && (
      card.summary.toLowerCase().includes("test") ||
      card.summary.toLowerCase().includes("verify") ||
      card.summary.toLowerCase().includes("integration")
    )),
    details: card.summary?.toLowerCase().includes("test")
      ? "Testing steps included in implementation"
      : "No testing steps found — improvement verification missing",
  });

  checks.push({
    phase: "improve",
    name: "Rollback plan exists",
    passed: !!(card.summary && card.summary.toLowerCase().includes("rollback")),
    details: card.summary?.toLowerCase().includes("rollback")
      ? "Rollback plan documented"
      : "No rollback plan — risk mitigation gap",
  });

  // ===== CONTROL =====
  checks.push({
    phase: "control",
    name: "Labels categorized",
    passed: (card.labels || []).length >= 1,
    details: (card.labels || []).length >= 1
      ? `${(card.labels || []).length} label(s) applied`
      : "No labels — categorization missing for process control",
  });

  checks.push({
    phase: "control",
    name: "Staging status set",
    passed: !!(card.staging_status && card.staging_status !== "staging"),
    details: card.staging_status === "production"
      ? "Marked for production"
      : "Still in staging — controlled deployment pending",
  });

  // Calculate score
  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);
  const passed = score >= 70; // 70% threshold for deployment

  const summary = `Six Sigma DMAIC Score: ${score}% (${passedCount}/${checks.length} checks passed)${
    !passed ? " — BLOCKED: Below 70% threshold for deployment" : " — CLEARED for deployment"
  }`;

  return { passed, score, checks, summary };
}

/** Format Six Sigma results as a log entry */
export function formatSixSigmaLog(result: SixSigmaResult): string {
  const phaseGroups = ["define", "measure", "analyze", "improve", "control"] as const;
  
  let log = `## 🔬 Six Sigma DMAIC Verification\n**Score: ${result.score}%** | ${result.passed ? "✅ PASSED" : "❌ BLOCKED"}\n\n`;

  for (const phase of phaseGroups) {
    const phaseChecks = result.checks.filter((c) => c.phase === phase);
    const phaseIcon = phase === "define" ? "📋" : phase === "measure" ? "📊" : phase === "analyze" ? "🔍" : phase === "improve" ? "🔧" : "🎛️";
    log += `### ${phaseIcon} ${phase.toUpperCase()}\n`;
    for (const check of phaseChecks) {
      log += `- ${check.passed ? "✅" : "❌"} **${check.name}**: ${check.details}\n`;
    }
    log += "\n";
  }

  return log;
}
