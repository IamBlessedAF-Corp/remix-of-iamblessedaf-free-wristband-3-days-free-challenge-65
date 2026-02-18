import { useState, useMemo } from "react";
import { useBoard } from "@/hooks/useBoard";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { PHASE_NEXT_STEPS, type NextStepItem } from "@/data/roadmapNextSteps";
import RoadmapSearchBar, { type RoadmapFilters } from "@/components/roadmap/RoadmapSearchBar";
import RoadmapItemActions from "@/components/roadmap/RoadmapItemActions";
import BulkSendToBoard from "@/components/roadmap/BulkSendToBoard";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  const totalCards = board.cards.length;
  const completedCards = board.cards.filter(c => c.completed_at).length;
  const completionPct = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<RoadmapFilters>({ keyword: "", status: "", priority: "" });

  const colGroups = board.columns.map(col => ({
    name: col.name.slice(0, 14),
    value: board.cards.filter(c => c.column_id === col.id).length,
  }));

  const allItems = useMemo(() => {
    return Object.entries(PHASE_NEXT_STEPS).flatMap(([phase, items]) =>
      items.map(item => ({ ...item, phase }))
    );
  }, []);

  const filtered = useMemo(() => {
    return allItems.filter(item => {
      if (filters.keyword && !`${item.title} ${item.detail}`.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
      if (filters.priority && item.priority !== filters.priority) return false;
      return true;
    });
  }, [allItems, filters]);

  const togglePhase = (phase: string) => setOpenPhases(prev => ({ ...prev, [phase]: !prev[phase] }));

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Roadmap"
        description="Live from board cards — milestone tracking"
        kpis={[
          { label: "Total Items", value: totalCards },
          { label: "Completed", value: `${completionPct}%` },
          { label: "In Progress", value: board.cards.filter(c => !c.completed_at).length },
          { label: "Columns", value: board.columns.length },
        ]}
        charts={[{ type: "bar", title: "Items per Stage", data: colGroups }]}
      />

      <RoadmapSearchBar filters={filters} onChange={setFilters} matchCount={filtered.length} totalCount={allItems.length} />

      <div className="space-y-2">
        {Object.entries(PHASE_NEXT_STEPS).map(([phase, items]) => {
          const phaseItems = filtered.filter(i => i.phase === phase);
          if (phaseItems.length === 0) return null;
          const isOpen = openPhases[phase] ?? false;
          return (
            <div key={phase} className="border border-border/40 rounded-lg overflow-hidden">
              <button onClick={() => togglePhase(phase)} className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-secondary/30 transition-colors">
                <span className="text-sm font-semibold text-foreground">{PHASE_LABELS[phase] || phase} <span className="text-muted-foreground font-normal">({phaseItems.length})</span></span>
                <div className="flex items-center gap-2">
                  <BulkSendToBoard sectionLabel={PHASE_LABELS[phase] || phase} items={phaseItems} />
                  {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>
              {isOpen && (
                <div className="divide-y divide-border/30">
                  {phaseItems.map((item, idx) => (
                    <div key={idx} className="px-4 py-2.5 flex items-start gap-3 hover:bg-secondary/20 transition-colors">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</p>
                      </div>
                      <RoadmapItemActions title={item.title} detail={item.detail} phaseName={phase} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
