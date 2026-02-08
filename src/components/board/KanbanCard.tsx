import { Draggable } from "@hello-pangea/dnd";
import type { BoardCard } from "@/hooks/useBoard";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Zap, Star, Image, FileText, ExternalLink, ClipboardList } from "lucide-react";

interface KanbanCardProps {
  card: BoardCard;
  index: number;
  onClick: (card: BoardCard) => void;
  canEdit: boolean;
}

const priorityConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  critical: { color: "bg-red-500", icon: <AlertTriangle className="w-3 h-3" /> },
  high: { color: "bg-orange-500", icon: <Zap className="w-3 h-3" /> },
  medium: { color: "bg-blue-500", icon: <Star className="w-3 h-3" /> },
  low: { color: "bg-muted", icon: <Clock className="w-3 h-3" /> },
};

const KanbanCard = ({ card, index, onClick, canEdit }: KanbanCardProps) => {
  const priority = priorityConfig[card.priority] || priorityConfig.medium;
  const hasScreenshots = card.screenshots && card.screenshots.length > 0;
  const hasLogs = !!card.logs;
  const hasSummary = !!card.summary;
  const hasPreviewLink = !!card.preview_link;
  const hasReviewEvidence = hasScreenshots || hasLogs || hasSummary || hasPreviewLink;

  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={!canEdit}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(card)}
          className={`bg-card border border-border rounded-lg p-3 mb-2 cursor-pointer transition-all hover:shadow-md ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-primary/30 rotate-2" : ""
          }`}
        >
          {/* Priority bar */}
          <div className={`h-1 w-8 rounded-full ${priority.color} mb-2`} />

          {/* Title */}
          <h4 className="text-sm font-semibold text-foreground leading-tight mb-2">
            {card.title}
          </h4>

          {/* Description preview */}
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {card.description}
            </p>
          )}

          {/* Screenshot thumbnail */}
          {hasScreenshots && (
            <div className="mb-2 rounded overflow-hidden border border-border">
              <img
                src={card.screenshots[0]}
                alt="Screenshot"
                className="w-full h-24 object-cover object-top"
                loading="lazy"
              />
              {card.screenshots.length > 1 && (
                <div className="text-[10px] text-center text-muted-foreground bg-muted py-0.5">
                  +{card.screenshots.length - 1} more screenshots
                </div>
              )}
            </div>
          )}

          {/* Review evidence indicators */}
          {hasReviewEvidence && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {hasScreenshots && (
                <div className="flex items-center gap-0.5 text-muted-foreground" title="Has screenshots">
                  <Image className="w-3 h-3" />
                  <span className="text-[10px]">{card.screenshots.length}</span>
                </div>
              )}
              {hasLogs && (
                <div className="flex items-center gap-0.5 text-muted-foreground" title="Has dev logs">
                  <FileText className="w-3 h-3" />
                  <span className="text-[10px]">Logs</span>
                </div>
              )}
              {hasSummary && (
                <div className="flex items-center gap-0.5 text-muted-foreground" title="Has summary">
                  <ClipboardList className="w-3 h-3" />
                  <span className="text-[10px]">Summary</span>
                </div>
              )}
              {hasPreviewLink && (
                <div className="flex items-center gap-0.5 text-primary" title="Has preview link">
                  <ExternalLink className="w-3 h-3" />
                  <span className="text-[10px]">Preview</span>
                </div>
              )}
            </div>
          )}

          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {label}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer: priority + staging */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-muted-foreground">
              {priority.icon}
              <span className="text-[10px] capitalize">{card.priority}</span>
            </div>
            <Badge
              variant={card.staging_status === "production" ? "default" : "outline"}
              className="text-[10px] px-1.5 py-0"
            >
              {card.staging_status === "production" ? "🟢 Live" : "🔵 Staging"}
            </Badge>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
