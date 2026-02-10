import { Droppable } from "@hello-pangea/dnd";
import type { BoardColumn, BoardCard } from "@/hooks/useBoard";
import KanbanCard from "./KanbanCard";
import { Button } from "@/components/ui/button";
import { Plus, Hand } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KanbanColumnProps {
  column: BoardColumn;
  cards: BoardCard[];
  onCardClick: (card: BoardCard) => void;
  onAddCard?: (columnId: string) => void;
  canEdit: boolean;
  wipLimit?: number;
  blockingCardIds?: Set<string>;
  warningCardIds?: Set<string>;
  allColumns?: BoardColumn[];
  onAdvanceCard?: (cardId: string, nextColumnId: string) => void;
  onScreenshotAdded?: (cardId: string, screenshots: string[]) => void;
}

const KanbanColumn = ({ column, cards, onCardClick, onAddCard, canEdit, wipLimit, blockingCardIds, warningCardIds, allColumns, onAdvanceCard, onScreenshotAdded }: KanbanColumnProps) => {
  const isAtLimit = wipLimit !== undefined && cards.length >= wipLimit;
  const isManualOnly = column.name.includes("3 Outcomes") || column.name.includes("Ideas") || column.name.includes("👀 Review");

  return (
    <div className="flex-shrink-0 w-[280px] sm:w-72 bg-muted/30 rounded-xl flex flex-col max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-120px)] snap-center">
      {/* Column header */}
      <div
        className="px-3 py-2.5 rounded-t-xl border-b border-border flex items-center justify-between"
        style={{ borderTopColor: column.color, borderTopWidth: "3px" }}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-foreground truncate max-w-[180px]">
            {column.name}
          </h3>
          <span className={`text-xs rounded-full px-2 py-0.5 ${
            isAtLimit ? "bg-destructive/20 text-destructive font-bold" : "text-muted-foreground bg-muted"
          }`}>
            {cards.length}{wipLimit !== undefined ? `/${wipLimit}` : ""}
          </span>
          {isManualOnly && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-500">
                    <Hand className="w-3 h-3" />
                    <span className="text-[9px] font-semibold uppercase tracking-wide">Manual</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Drag & drop only — no auto-advance
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {canEdit && onAddCard && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onAddCard(column.id)}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Cards area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <ScrollArea className="flex-1">
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-2 min-h-[100px] transition-colors ${
                snapshot.isDraggingOver ? "bg-primary/5" : ""
              }`}
            >
              {cards.map((card, index) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  index={index}
                  onClick={onCardClick}
                  canEdit={canEdit}
                  isBlocking={blockingCardIds?.has(card.id)}
                  isWarning={warningCardIds?.has(card.id)}
                  columns={allColumns}
                  onAdvance={onAdvanceCard}
                  onScreenshotAdded={onScreenshotAdded}
                />
              ))}
              {provided.placeholder}
            </div>
          </ScrollArea>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
