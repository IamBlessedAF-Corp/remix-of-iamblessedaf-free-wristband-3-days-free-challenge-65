import { useState, useMemo, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import KanbanColumn from "./KanbanColumn";
import CardDetailModal from "./CardDetailModal";
import CreateCardModal from "./CreateCardModal";
import PublishGateModal from "./PublishGateModal";
import { type BoardCard, type BoardColumn } from "@/hooks/useBoard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface KanbanBoardProps {
  isAdmin: boolean;
  columns: BoardColumn[];
  cards: BoardCard[];
  loading: boolean;
  moveCard: (cardId: string, newColumnId: string, newPosition: number) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<BoardCard>) => Promise<void>;
  createCard: (card: Partial<BoardCard>) => Promise<any>;
  deleteCard: (cardId: string) => Promise<void>;
}

/** Columns at position >= 10 are review/done — locked for non-admins */
const REVIEW_POSITION_THRESHOLD = 10;

/** WIP column only allows 1 active card at a time */
const WIP_COLUMN_NAME = "6)  🔨 Work in Progress";
const WIP_LIMIT = 1;

/** Done column name for publish gate */
const DONE_COLUMN_NAME = "12)  ✅ Done";

const KanbanBoard = ({ isAdmin, columns, cards, loading, moveCard, updateCard, createCard, deleteCard }: KanbanBoardProps) => {
  const [selectedCard, setSelectedCard] = useState<BoardCard | null>(null);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [publishGateCard, setPublishGateCard] = useState<BoardCard | null>(null);
  const [pendingDrop, setPendingDrop] = useState<{ cardId: string; columnId: string; position: number } | null>(null);

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

  const wipColumnId = useMemo(
    () => columns.find((c) => c.name === WIP_COLUMN_NAME)?.id,
    [columns]
  );

  const doneColumnId = useMemo(
    () => columns.find((c) => c.name === DONE_COLUMN_NAME)?.id,
    [columns]
  );

  /** All critical-priority cards pulse as blockers regardless of column */
  const blockingCardIds = useMemo(() => {
    const ids = new Set<string>();
    cards.forEach((card) => {
      if (card.priority === "critical") {
        ids.add(card.id);
      }
    });
    return ids;
  }, [cards]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;

    // Non-admins can't drag FROM or TO review columns
    if (!isAdmin && (isReviewColumn(source.droppableId) || isReviewColumn(destination.droppableId))) {
      return;
    }

    // WIP limit: only 1 card allowed at a time (except when moving within WIP)
    if (
      wipColumnId &&
      destination.droppableId === wipColumnId &&
      source.droppableId !== wipColumnId
    ) {
      const wipCards = cardsByColumn[wipColumnId] || [];
      if (wipCards.length >= WIP_LIMIT) {
        toast.error(`WIP limit reached (${WIP_LIMIT}). Finish the current card first.`);
        return;
      }
    }

    // Publish Gate: intercept moves TO Done column
    if (doneColumnId && destination.droppableId === doneColumnId && source.droppableId !== doneColumnId) {
      const card = cards.find((c) => c.id === draggableId);
      if (card) {
        setPublishGateCard(card);
        setPendingDrop({ cardId: draggableId, columnId: destination.droppableId, position: destination.index });
        return;
      }
    }

    moveCard(draggableId, destination.droppableId, destination.index);
  };

  const handlePublishConfirm = () => {
    if (pendingDrop) {
      moveCard(pendingDrop.cardId, pendingDrop.columnId, pendingDrop.position);
      toast.success("Card moved to Done — ready to publish! 🚀");
    }
    setPublishGateCard(null);
    setPendingDrop(null);
  };

  const handlePublishCancel = () => {
    setPublishGateCard(null);
    setPendingDrop(null);
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
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 px-3 sm:px-4 snap-x snap-mandatory sm:snap-none">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={cardsByColumn[column.id] || []}
              onCardClick={setSelectedCard}
              onAddCard={(colId) => setCreateColumnId(colId)}
              canEdit={canEditInColumn(column.id)}
              wipLimit={column.id === wipColumnId ? WIP_LIMIT : undefined}
              blockingCardIds={blockingCardIds}
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
      <PublishGateModal
        card={publishGateCard}
        open={!!publishGateCard}
        onClose={handlePublishCancel}
        onConfirm={handlePublishConfirm}
      />
    </>
  );
};

export default KanbanBoard;
