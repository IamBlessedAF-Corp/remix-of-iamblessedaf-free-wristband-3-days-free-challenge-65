import { useState, useMemo } from "react";
import { useBoard } from "@/hooks/useBoard";
import { useRoadmapCompletions } from "@/hooks/useRoadmapCompletions";
import { useRoadmapItems } from "@/hooks/useRoadmapItems";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import RoadmapSearchBar, { type RoadmapFilters } from "@/components/roadmap/RoadmapSearchBar";
import RoadmapItemActions from "@/components/roadmap/RoadmapItemActions";
import BulkSendToBoard from "@/components/roadmap/BulkSendToBoard";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Trophy, RefreshCw, Database } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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

const PRIORITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10",
  high: "text-orange-400 bg-orange-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  low: "text-emerald-400 bg-emerald-500/10",
};

export default function RoadmapTab() {
  const board = useBoard();
  const { isCompleted, markDone, unmarkDone, completions } = useRoadmapCompletions();
  const { items: roadmapItems, byPhase, isLoading, isFromDb, seedFromStatic } = useRoadmapItems();
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<RoadmapFilters>({ keyword: "", status: "", priority: "" });

  const totalRoadmapItems = roadmapItems.length;
  const totalCompleted = completions.length;
  const overallPct = totalRoadmapItems > 0 ? Math.round((totalCompleted / totalRoadmapItems) * 100) : 0;

  const phaseStats = useMemo(() => {
    const stats: Record<string, { total: number; done: number; pct: number }> = {};
    for (const [phase, items] of Object.entries(byPhase)) {
      const done = items.filter(i => isCompleted(phase, i.title)).length;
      stats[phase] = { total: items.length, done, pct: items.length > 0 ? Math.round((done / items.length) * 100) : 0 };
    }
    return stats;
  }, [byPhase, isCompleted, completions]);

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

  const colGroups = board.columns.map(col => ({
    name: col.name.slice(0, 14),
    value: board.cards.filter(c => c.column_id === col.id).length,
  }));

  if (isLoading) {
    return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Project Roadmap</h2>
          </div>
          <span className="text-2xl font-black text-primary">{overallPct}%</span>
        </div>
        <Progress value={overallPct} className="h-3 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">{totalCompleted}/{totalRoadmapItems}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-red-400">{criticalRemaining}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Critical Left</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-orange-400">{highRemaining}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">High Left</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">{Object.keys(byPhase).length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Phases</p>
          </div>
        </div>
      </div>

      {/* Phase Completion Overview Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {Object.entries(byPhase).map(([phase]) => {
          const s = phaseStats[phase];
          if (!s) return null;
          const emoji = PHASE_LABELS[phase]?.split(" ")[0] || "📋";
          return (
            <button
              key={phase}
              onClick={() => setOpenPhases(prev => ({ ...prev, [phase]: true }))}
              className="bg-card border border-border/30 rounded-lg p-2.5 text-center hover:bg-secondary/30 transition-colors group"
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
        {Object.entries(byPhase).map(([phase, items]) => {
          const phaseItems = filtered.filter(i => i.phase === phase);
          if (phaseItems.length === 0) return null;
          const isOpen = openPhases[phase] ?? false;
          const s = phaseStats[phase];
          if (!s) return null;
          return (
            <div key={phase} className="border border-border/40 rounded-lg overflow-hidden">
              <button onClick={() => togglePhase(phase)} className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{PHASE_LABELS[phase] || phase}</span>
                  <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[200px]">
                    <Progress value={s.pct} className="h-1.5 flex-1" />
                    <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{s.done}/{s.total}</span>
                  </div>
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
                    return (
                      <div key={item.id || idx} className={`px-4 py-2.5 flex items-start gap-3 hover:bg-secondary/20 transition-colors ${done ? "opacity-50" : ""}`}>
                        <button
                          onClick={() => done ? unmarkDone.mutate({ title: item.title, phase: item.phase }) : markDone.mutate({ title: item.title, phase: item.phase })}
                          className="mt-0.5 shrink-0"
                          title={done ? "Mark as not done" : "Mark as done"}
                        >
                          {done ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />}
                        </button>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.title}</p>
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
