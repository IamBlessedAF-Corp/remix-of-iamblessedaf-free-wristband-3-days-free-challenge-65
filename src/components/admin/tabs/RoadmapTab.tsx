import { lazy, Suspense } from "react";
import { useBoard } from "@/hooks/useBoard";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { RefreshCw } from "lucide-react";

const RoadmapContent = lazy(() => import("@/pages/Roadmap"));

export default function RoadmapTab() {
  const board = useBoard();
  const totalCards = board.cards.length;
  const completedCards = board.cards.filter(c => c.completed_at).length;
  const completionPct = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  const colGroups = board.columns.map(col => ({
    name: col.name.slice(0, 14),
    value: board.cards.filter(c => c.column_id === col.id).length,
  }));

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
      <Suspense fallback={<div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>}>
        <RoadmapContent />
      </Suspense>
    </div>
  );
}
