import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useBoard } from "@/hooks/useBoard";
import { useRoadmapCompletions } from "@/hooks/useRoadmapCompletions";
import { useRoadmapItems } from "@/hooks/useRoadmapItems";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import RoadmapSearchBar, { type RoadmapFilters } from "@/components/roadmap/RoadmapSearchBar";
import RoadmapItemActions from "@/components/roadmap/RoadmapItemActions";
import BulkSendToBoard from "@/components/roadmap/BulkSendToBoard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ChevronDown, ChevronRight, CheckCircle2, Circle, Trophy,
  RefreshCw, Database, Zap, AlertTriangle, Loader2, XCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PHASE_LABELS: Record<string, string> = {
  foundation: "🏗️ Foundation & Security",
  funnel: "🔄 Funnel & Revenue",
  virality: "🚀 Virality & Referrals",
  gamification: "🎮 Gamification & Retention",
  ops: "⚙️ Operations & DevOps",
  analytics: "📊 Analytics & Intelligence",
  comms: "📬 Communications & Messaging",
  conversion: "🎯 Conversion Optimization",
  impact: "🌍 Impact & Community",
};

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border border-red-500/30",
  high: "text-orange-400 bg-orange-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  low: "text-emerald-400 bg-emerald-500/10",
};

// Keywords in changelog/board titles that map to roadmap titles (fuzzy match)
const DONE_KEYWORDS: Record<string, string[]> = {
  "error monitor": ["error", "monitor", "ingest-error", "error_events"],
  "rls": ["rls", "row level security", "policy"],
  "audit log": ["audit", "audit_log"],
  "stripe webhook": ["stripe", "webhook"],
  "sms router": ["sms-router", "sms router", "twilio"],
  "short link": ["short-link", "short link", "go redirect"],
  "budget control": ["budget", "budget_cycles", "budget_segments"],
  "clipper": ["clipper", "clip_submissions", "clip-approved"],
  "gamification": ["gamification", "bc_wallet", "bc_coins"],
  "realtime sync": ["realtime", "useRealtimeSync"],
  "expert scripts": ["expert-scripts", "expert_scripts"],
  "backup verification": ["verify-backup", "backup_verifications"],
  "referral": ["referral", "referral_code", "blessings"],
  "challenge": ["challenge", "gratitude", "challenge_participants"],
};

function fuzzyMatchTitle(roadmapTitle: string, changelogText: string): boolean {
  const lower = roadmapTitle.toLowerCase();
  const cl = changelogText.toLowerCase();

  // Direct substring match
  if (cl.includes(lower.slice(0, Math.min(15, lower.length)))) return true;

  // Keyword map match
  for (const [key, synonyms] of Object.entries(DONE_KEYWORDS)) {
    if (lower.includes(key)) {
      if (synonyms.some(s => cl.includes(s))) return true;
    }
  }

  return false;
}

// Per-item states for the smart verify flow
type VerifyState = "idle" | "verifying" | "verified" | "failed";

export default function RoadmapTab() {
  const qc = useQueryClient();
  const board = useBoard();
  const { isCompleted, markDone, unmarkDone, completions } = useRoadmapCompletions();
  const { items: roadmapItems, byPhase, isLoading, isFromDb, seedFromStatic } = useRoadmapItems();
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<RoadmapFilters>({ keyword: "", status: "", priority: "" });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  // Track per-item verify state: itemId → VerifyState
  const [verifyStates, setVerifyStates] = useState<Record<string, VerifyState>>({});

  const totalRoadmapItems = roadmapItems.length;
  const totalCompleted = completions.length;
  const overallPct = totalRoadmapItems > 0 ? Math.round((totalCompleted / totalRoadmapItems) * 100) : 0;

  // Sort items within each phase by priority
  const sortedByPhase = useMemo(() => {
    const sorted: Record<string, typeof roadmapItems> = {};
    for (const [phase, items] of Object.entries(byPhase)) {
      sorted[phase] = [...items].sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 99;
        const pb = PRIORITY_ORDER[b.priority] ?? 99;
        return pa - pb;
      });
    }
    return sorted;
  }, [byPhase]);

  const phaseStats = useMemo(() => {
    const stats: Record<string, { total: number; done: number; pct: number }> = {};
    for (const [phase, items] of Object.entries(sortedByPhase)) {
      const done = items.filter(i => isCompleted(phase, i.title)).length;
      stats[phase] = { total: items.length, done, pct: items.length > 0 ? Math.round((done / items.length) * 100) : 0 };
    }
    return stats;
  }, [sortedByPhase, isCompleted, completions]);

  const allItemsWithPhase = roadmapItems.map(item => ({ ...item, phase: item.phase }));

  const filtered = useMemo(() => {
    return allItemsWithPhase.filter(item => {
      if (filters.keyword && !`${item.title} ${item.detail}`.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
      if (filters.priority && item.priority !== filters.priority) return false;
      if (filters.status === "done" && !isCompleted(item.phase, item.title)) return false;
      if (filters.status === "pending" && isCompleted(item.phase, item.title)) return false;
      return true;
    });
  }, [allItemsWithPhase, filters, isCompleted]);

  const criticalRemaining = allItemsWithPhase.filter(i => i.priority === "critical" && !isCompleted(i.phase, i.title)).length;
  const highRemaining = allItemsWithPhase.filter(i => i.priority === "high" && !isCompleted(i.phase, i.title)).length;

  const togglePhase = (phase: string) => setOpenPhases(prev => ({ ...prev, [phase]: !prev[phase] }));

  // ── Smart Verify & Mark ──
  // When the user clicks the completion circle manually on a pending item,
  // we run a verification scan (same logic as Smart Update) to confirm the
  // prompt was actually executed. If confirmed → mark done. If not found →
  // ask user to confirm manually. If already done → unmark.
  const verifyAndMark = useCallback(async (itemId: string, title: string, phase: string, done: boolean) => {
    if (done) {
      // Already done → just unmark
      unmarkDone.mutate({ title, phase });
      return;
    }

    // Start verifying
    setVerifyStates(prev => ({ ...prev, [itemId]: "verifying" }));
    toast.info(`🔍 Verifying "${title}"…`, { duration: 2500 });

    try {
      const [{ data: changelog }, { data: doneCards }] = await Promise.all([
        supabase
          .from("changelog_entries")
          .select("prompt_summary, change_details, affected_areas")
          .order("created_at", { ascending: false })
          .limit(300),
        supabase
          .from("board_cards")
          .select("title, description")
          .not("completed_at", "is", null),
      ]);

      const doneSignals: string[] = [
        ...(changelog || []).map(c => `${c.prompt_summary} ${c.change_details || ""} ${(c.affected_areas || []).join(" ")}`),
        ...(doneCards || []).map(c => `${c.title} ${c.description || ""}`),
      ];

      const verified = doneSignals.some(signal => fuzzyMatchTitle(title, signal));

      if (verified) {
        // Verified via project data → mark as done
        setVerifyStates(prev => ({ ...prev, [itemId]: "verified" }));
        markDone.mutate({ title, phase });
        toast.success(`✅ Verified! "${title}" confirmed complete via changelog/board.`);
      } else {
        // Not found in signals → prompt user for manual confirmation
        setVerifyStates(prev => ({ ...prev, [itemId]: "failed" }));
        toast.warning(
          `⚠️ Could not auto-verify "${title}". Mark manually?`,
          {
            duration: 8000,
            action: {
              label: "Yes, mark done",
              onClick: () => {
                markDone.mutate({ title, phase });
                setVerifyStates(prev => ({ ...prev, [itemId]: "verified" }));
              },
            },
          }
        );
        // Reset failed state after a few seconds so icon doesn't stay red
        setTimeout(() => setVerifyStates(prev => ({ ...prev, [itemId]: "idle" })), 8000);
      }
    } catch (err) {
      console.error("Verify error:", err);
      setVerifyStates(prev => ({ ...prev, [itemId]: "failed" }));
      toast.error(`Verification failed for "${title}". Try again.`);
      setTimeout(() => setVerifyStates(prev => ({ ...prev, [itemId]: "idle" })), 5000);
    }
  }, [markDone, unmarkDone]);

  const colGroups = board.columns.map(col => ({
    name: col.name.slice(0, 14),
    value: board.cards.filter(c => c.column_id === col.id).length,
  }));

  // ── Smart Roadmap Update ──
  const handleSmartUpdate = useCallback(async () => {
    setIsSyncing(true);
    toast.info("🔍 Scanning all project changes...", { duration: 3000 });

    try {
      // 1. Pull all changelog entries
      const { data: changelog } = await supabase
        .from("changelog_entries")
        .select("prompt_summary, change_details, affected_areas, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      // 2. Pull completed board cards
      const { data: doneCards } = await supabase
        .from("board_cards")
        .select("title, description, completed_at")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      // 3. Pull recent error_events to flag critical issues
      const { data: criticalErrors } = await supabase
        .from("error_events")
        .select("message, level, component")
        .eq("level", "fatal")
        .is("resolved_at", null)
        .limit(20);

      // Build a corpus of all "done" signals
      const doneSignals: string[] = [
        ...(changelog || []).map(c => `${c.prompt_summary} ${c.change_details || ""} ${(c.affected_areas || []).join(" ")}`),
        ...(doneCards || []).map(c => `${c.title} ${c.description || ""}`),
      ];

      // 4. For each roadmap item not yet completed, check if it appears in done signals
      let autoMarked = 0;
      const pendingItems = allItemsWithPhase.filter(i => !isCompleted(i.phase, i.title));

      for (const item of pendingItems) {
        const matchFound = doneSignals.some(signal => fuzzyMatchTitle(item.title, signal));
        if (matchFound) {
          await supabase
            .from("roadmap_completions")
            .insert({ item_title: item.title, phase: item.phase })
            .then(({ error }) => {
              if (!error) autoMarked++;
            });
        }
      }

      // 5. Warn about unresolved critical errors blocking roadmap items
      if (criticalErrors && criticalErrors.length > 0) {
        toast.warning(
          `⚠️ ${criticalErrors.length} unresolved fatal error(s) detected — check Error Monitor tab`,
          { duration: 6000 }
        );
      }

      const now = new Date().toLocaleTimeString();
      setLastSynced(now);

      if (autoMarked > 0) {
        toast.success(`✅ Roadmap updated! Auto-marked ${autoMarked} item(s) as done.`);
        // Properly invalidate the React Query cache so UI re-renders
        await qc.invalidateQueries({ queryKey: ["roadmap-completions"] });
      } else {
        toast.info(`✅ Sync complete — no new completions detected. Last synced: ${now}`);
      }
    } catch (err) {
      console.error("Roadmap sync error:", err);
      toast.error("Sync failed — check console for details");
    } finally {
      setIsSyncing(false);
    }
  }, [allItemsWithPhase, isCompleted, qc]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">

      {/* ── Top Action Bar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Project Roadmap</h2>
          {lastSynced && (
            <span className="text-[10px] text-muted-foreground">Last synced: {lastSynced}</span>
          )}
        </div>

        <Button
          onClick={handleSmartUpdate}
          disabled={isSyncing}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          size="sm"
        >
          {isSyncing ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Scanning Changes...</>
          ) : (
            <><Zap className="w-3.5 h-3.5" /> Update Roadmap</>
          )}
        </Button>
      </div>

      {/* Critical alert banner */}
      {criticalRemaining > 0 && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-400 font-semibold">
            🚨 {criticalRemaining} CRITICAL item{criticalRemaining > 1 ? "s" : ""} need immediate attention — click "Update Roadmap" to auto-detect what's done
          </p>
        </div>
      )}

      {/* Seed banner */}
      {!isFromDb && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-500 font-medium">Roadmap is using static file. Seed to database for full CRUD.</span>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
            onClick={() => seedFromStatic.mutate()} disabled={seedFromStatic.isPending}>
            {seedFromStatic.isPending ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : null}
            Seed to DB
          </Button>
        </div>
      )}

      {isFromDb && (
        <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500">
          ✅ Live from database
        </Badge>
      )}

      {/* Overall Progress Header */}
      <div className="bg-card border border-border/40 rounded-xl p-5">
        <Progress value={overallPct} className="h-3 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">{totalCompleted}/{totalRoadmapItems}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
            <p className={`text-lg font-bold text-red-400 ${criticalRemaining > 0 ? "animate-pulse" : ""}`}>{criticalRemaining}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Critical Left</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-orange-400">{highRemaining}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">High Left</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">{overallPct}%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall</p>
          </div>
        </div>
      </div>

      {/* Phase Completion Overview Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {Object.entries(sortedByPhase).map(([phase]) => {
          const s = phaseStats[phase];
          if (!s) return null;
          const emoji = PHASE_LABELS[phase]?.split(" ")[0] || "📋";
          return (
            <button
              key={phase}
              onClick={() => setOpenPhases(prev => ({ ...prev, [phase]: true }))}
              className="bg-card border border-border/30 rounded-lg p-2.5 text-center hover:bg-secondary/30 transition-colors"
            >
              <span className="text-lg">{emoji}</span>
              <div className="mt-1">
                <Progress value={s.pct} className="h-1.5 mb-1" />
                <p className="text-[10px] font-bold text-foreground">{s.pct}%</p>
                <p className="text-[8px] text-muted-foreground">{s.done}/{s.total}</p>
              </div>
            </button>
          );
        })}
      </div>

      <AdminSectionDashboard
        title="Board Sync"
        description="Live from board cards — milestone tracking"
        defaultCollapsed={true}
        kpis={[
          { label: "Board Cards", value: board.cards.length },
          { label: "Board Done", value: board.cards.filter(c => c.completed_at).length },
          { label: "In Progress", value: board.cards.filter(c => !c.completed_at).length },
          { label: "Columns", value: board.columns.length },
        ]}
        charts={[{ type: "bar", title: "Items per Stage", data: colGroups }]}
      />

      <RoadmapSearchBar filters={filters} onChange={setFilters} matchCount={filtered.length} totalCount={allItemsWithPhase.length} />

      <div className="space-y-2">
        {Object.entries(sortedByPhase).map(([phase, phaseItemsSorted]) => {
          const phaseItems = phaseItemsSorted.filter(i => filtered.some(f => f.id === i.id || f.title === i.title));
          if (phaseItems.length === 0) return null;
          const isOpen = openPhases[phase] ?? false;
          const s = phaseStats[phase];
          if (!s) return null;

          // Count criticals in this phase
          const phaseCriticals = phaseItems.filter(i => i.priority === "critical" && !isCompleted(phase, i.title)).length;

          return (
            <div key={phase} className={`border rounded-lg overflow-hidden ${phaseCriticals > 0 ? "border-red-500/30" : "border-border/40"}`}>
              <button onClick={() => togglePhase(phase)} className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{PHASE_LABELS[phase] || phase}</span>
                  <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[200px]">
                    <Progress value={s.pct} className="h-1.5 flex-1" />
                    <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{s.done}/{s.total}</span>
                  </div>
                  {phaseCriticals > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse shrink-0">
                      🚨 {phaseCriticals} CRITICAL
                    </span>
                  )}
                  <span className="text-muted-foreground text-xs font-normal">({phaseItems.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  {s.pct === 100 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  <BulkSendToBoard sectionLabel={PHASE_LABELS[phase] || phase} items={phaseItems} />
                  {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {isOpen && (
                <div className="divide-y divide-border/30">
                  {phaseItems.map((item, idx) => {
                    const done = isCompleted(item.phase, item.title);
                    const isCritical = item.priority === "critical" && !done;
                    const itemId = item.id || `${item.phase}-${idx}`;
                    const vState = verifyStates[itemId] ?? "idle";

                    const circleIcon = done
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      : vState === "verifying"
                        ? <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        : vState === "failed"
                          ? <XCircle className="w-4 h-4 text-destructive" />
                          : <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />;

                    const tooltipLabel = done
                      ? "Unmark as done"
                      : vState === "verifying"
                        ? "Verifying…"
                        : "Mark as Completed";

                    return (
                      <div
                        key={itemId}
                        className={`px-4 py-2.5 flex items-start gap-3 transition-colors
                          ${done ? "opacity-50 bg-transparent" : "hover:bg-secondary/20"}
                          ${isCritical ? "bg-red-500/5 border-l-2 border-red-500/50" : ""}
                        `}
                      >
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => verifyAndMark(itemId, item.title, item.phase, done)}
                                disabled={vState === "verifying"}
                                className="mt-0.5 shrink-0 disabled:cursor-wait"
                                aria-label={tooltipLabel}
                              >
                                {circleIcon}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs">
                              {tooltipLabel}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${PRIORITY_COLORS[item.priority]} ${isCritical ? "animate-pulse" : ""}`}>
                          {isCritical && "🔴 "}{item.priority.toUpperCase()}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${done ? "line-through text-muted-foreground" : isCritical ? "text-red-300" : "text-foreground"}`}>
                            {item.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</p>
                        </div>

                        <RoadmapItemActions title={item.title} detail={item.detail} phaseName={phase} />
                      </div>
                    );
                  })}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
