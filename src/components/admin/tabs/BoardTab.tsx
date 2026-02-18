import { useState } from "react";
import { useBoard } from "@/hooks/useBoard";
import { useAutoExecute } from "@/hooks/useAutoExecute";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import KanbanBoard from "@/components/board/KanbanBoard";
import PipelineControls from "@/components/board/PipelineControls";
import { Input } from "@/components/ui/input";

export default function BoardTab() {
  const board = useBoard();
  const autoExec = useAutoExecute(board.refetch);
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = searchQuery.trim() ? board.cards.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase())) : board.cards;

  const colCounts = board.columns.map(col => ({
    name: col.name.slice(0, 10),
    value: board.cards.filter(c => c.column_id === col.id).length,
  }));

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Kanban Board"
        description="Ideas → In Development → Testing → Live → Optimizing"
        kpis={[
          { label: "Total Cards", value: board.cards.length },
          { label: "Columns", value: board.columns.length },
          ...board.columns.slice(0, 4).map(col => ({
            label: col.name.slice(0, 12),
            value: board.cards.filter(c => c.column_id === col.id).length,
          })),
        ]}
        charts={[{ type: "bar", title: "Cards per Column", data: colCounts }]}
      />
      <PipelineControls columns={board.columns} isRunning={autoExec.isRunning} currentPhase={autoExec.currentPhase} currentCardTitle={autoExec.currentCardTitle} processedCount={autoExec.processedCount} onExecute={autoExec.execute} onSweep={autoExec.sweep} onStop={autoExec.stop} />
      <Input placeholder="Search cards..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-xs" />
      <KanbanBoard isAdmin={true} columns={board.columns} cards={filtered} loading={board.loading} moveCard={board.moveCard} updateCard={board.updateCard} createCard={board.createCard} deleteCard={board.deleteCard} />
    </div>
  );
}
