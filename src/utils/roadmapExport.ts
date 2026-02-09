/**
 * Export the full roadmap as a structured Markdown file.
 */

interface ExportItem {
  title: string;
  status: string;
  priority?: string;
  detail?: string;
  labels?: string[];
}

interface ExportPhase {
  title: string;
  subtitle: string;
  status: string;
  delegationScore?: number;
  items: ExportItem[];
}

interface ExportTrackingGroup {
  title: string;
  items: { title: string; detail: string; priority: string }[];
}

export function exportRoadmapMarkdown(
  phases: ExportPhase[],
  nextSteps: Record<string, { title: string; detail: string; priority: string }[]>,
  trackingGroups: ExportTrackingGroup[]
): string {
  const lines: string[] = [];
  const now = new Date().toISOString().substring(0, 10);

  lines.push("# IamBlessedAF — Full Project Roadmap");
  lines.push(`> Exported: ${now}`);
  lines.push("");

  // Summary
  const allItems = phases.flatMap((p) => p.items);
  const done = allItems.filter((i) => i.status === "done").length;
  lines.push(`## Summary`);
  lines.push(`- **Total Items:** ${allItems.length}`);
  lines.push(`- **Completed:** ${done} (${Math.round((done / allItems.length) * 100)}%)`);
  lines.push(`- **In Progress:** ${allItems.filter((i) => i.status === "in-progress").length}`);
  lines.push(`- **Blocked:** ${allItems.filter((i) => i.status === "blocked").length}`);
  lines.push(`- **Planned:** ${allItems.filter((i) => i.status === "planned").length}`);
  lines.push("");

  // Phases
  for (const phase of phases) {
    const pDone = phase.items.filter((i) => i.status === "done").length;
    const pPct = Math.round((pDone / phase.items.length) * 100);
    lines.push(`---`);
    lines.push(`## ${phase.title}`);
    lines.push(`*${phase.subtitle}*`);
    lines.push(`- Status: **${phase.status}** | Progress: ${pDone}/${phase.items.length} (${pPct}%)${phase.delegationScore ? ` | DS: ${phase.delegationScore}` : ""}`);
    lines.push("");

    for (const item of phase.items) {
      const icon = item.status === "done" ? "✅" : item.status === "in-progress" ? "🔄" : item.status === "blocked" ? "🚫" : "📋";
      const tags = [item.priority, ...(item.labels || [])].filter(Boolean).map(t => `\`${t}\``).join(" ");
      lines.push(`${icon} **${item.title}** ${tags}`);
      if (item.detail) lines.push(`  > ${item.detail}`);
    }
    lines.push("");

    // Next steps for this phase
    const phaseId = phase.title.toLowerCase().includes("foundation") ? "foundation"
      : phase.title.toLowerCase().includes("funnel") ? "funnel"
      : phase.title.toLowerCase().includes("viral") ? "virality"
      : phase.title.toLowerCase().includes("gamification") ? "gamification"
      : phase.title.toLowerCase().includes("operations") ? "ops"
      : phase.title.toLowerCase().includes("analytics") ? "analytics"
      : phase.title.toLowerCase().includes("communication") ? "comms"
      : phase.title.toLowerCase().includes("conversion") ? "conversion"
      : phase.title.toLowerCase().includes("impact") ? "impact" : "";

    const ns = nextSteps[phaseId];
    if (ns && ns.length > 0) {
      lines.push(`### 🔬 Next 11 Optimizations`);
      for (const step of ns) {
        lines.push(`📋 **${step.title}** \`${step.priority}\``);
        lines.push(`  > ${step.detail}`);
      }
      lines.push("");
    }
  }

  // Tracking groups
  if (trackingGroups.length > 0) {
    lines.push(`---`);
    lines.push(`## 📊 Tracking & Engagement Groups`);
    lines.push("");
    for (const group of trackingGroups) {
      lines.push(`### ${group.title}`);
      for (const item of group.items) {
        lines.push(`📋 **${item.title}** \`${item.priority}\``);
        lines.push(`  > ${item.detail}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
