import { useState, useMemo, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import KanbanColumn from "./KanbanColumn";
import CardDetailModal from "./CardDetailModal";
import CreateCardModal from "./CreateCardModal";
import { useBoard, type BoardCard } from "@/hooks/useBoard";
import { Loader2 } from "lucide-react";

interface KanbanBoardProps {
  isAdmin: boolean;
}

/** Columns at position >= 9 are review/done — locked for non-admins */
const REVIEW_POSITION_THRESHOLD = 9;

const KanbanBoard = ({ isAdmin }: KanbanBoardProps) => {
  const { columns, cards, loading, moveCard, updateCard, createCard, deleteCard } = useBoard();
  const [selectedCard, setSelectedCard] = useState<BoardCard | null>(null);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);

  const reviewColumnIds = useMemo(
    () => new Set(columns.filter((c) => c.position >= REVIEW_POSITION_THRESHOLD).map((c) => c.id)),
    [columns]
  );

  const isReviewColumn = useCallback(
    (columnId: string) => reviewColumnIds.has(columnId),
    [reviewColumnIds]
  );

  /** Can the current user edit a card in the given column? */
  const canEditInColumn = useCallback(
    (columnId: string) => isAdmin || !isReviewColumn(columnId),
    [isAdmin, isReviewColumn]
  );

  const cardsByColumn = useMemo(() => {
    const map: Record<string, BoardCard[]> = {};
    columns.forEach((col) => {
      map[col.id] = cards
        .filter((c) => c.column_id === col.id)
        .sort((a, b) => a.position - b.position);
    });
    return map;
  }, [columns, cards]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;

    // Non-admins can't drag FROM or TO review columns
    if (!isAdmin && (isReviewColumn(source.droppableId) || isReviewColumn(destination.droppableId))) {
      return;
    }

    moveCard(draggableId, destination.droppableId, destination.index);
  };

  const handleCreateCard = async (card: Partial<BoardCard>) => {
    await createCard(card);
    setCreateColumnId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 px-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={cardsByColumn[column.id] || []}
              onCardClick={setSelectedCard}
              onAddCard={(colId) => setCreateColumnId(colId)}
              canEdit={canEditInColumn(column.id)}
            />
          ))}
        </div>
      </DragDropContext>

      <CardDetailModal
        card={selectedCard}
        columns={columns}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onSave={updateCard}
        onDelete={deleteCard}
        isAdmin={isAdmin}
        canEdit={selectedCard ? canEditInColumn(selectedCard.column_id) : false}
      />
      <CreateCardModal
        open={!!createColumnId}
        columnId={createColumnId || ""}
        columns={columns}
        onClose={() => setCreateColumnId(null)}
        onCreate={handleCreateCard}
      />
    </>
  );
};

export default KanbanBoard;
