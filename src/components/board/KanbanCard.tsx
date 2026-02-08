import { Draggable } from "@hello-pangea/dnd";
import type { BoardCard } from "@/hooks/useBoard";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Zap, Star, Image, FileText, ExternalLink, ClipboardList, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { getStageInfo } from "./StageSelector";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  card: BoardCard;
  index: number;
  onClick: (card: BoardCard) => void;
  canEdit: boolean;
  isBlocking?: boolean;
  isWarning?: boolean;
}

const priorityConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  critical: { color: "bg-red-500", icon: <AlertTriangle className="w-3 h-3" /> },
  high: { color: "bg-orange-500", icon: <Zap className="w-3 h-3" /> },
  medium: { color: "bg-blue-500", icon: <Star className="w-3 h-3" /> },
  low: { color: "bg-muted", icon: <Clock className="w-3 h-3" /> },
};

function getDelegationBadge(score: number) {
  if (score >= 70) return { text: `D:${score.toFixed(0)}`, className: "bg-green-500/20 text-green-400 border-green-500/40" };
  if (score >= 40) return { text: `D:${score.toFixed(0)}`, className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" };
  return { text: `D:${score.toFixed(0)}`, className: "bg-red-500/20 text-red-400 border-red-500/40" };
}

/** Derive the critical next action based on the card's stage */
function getNextAction(card: BoardCard): { label: string; description: string } | null {
  const stage = card.stage || "idea";
  switch (stage) {
    case "idea":
      return { label: "Clarify Scope", description: "Define requirements & acceptance criteria" };
    case "spec":
      return { label: "Start Execution", description: "Begin implementation in dev environment" };
    case "dev":
      return { label: "Submit for Review", description: "Code complete — push to validation" };
    case "review":
      return { label: "Validate & Test", description: "Run QA checks and capture proof" };
    case "live":
      return { label: "Monitor & Close", description: "Verify production stability" };
    default:
      return { label: "Move Forward", description: "Advance to next pipeline stage" };
  }
}

const KanbanCard = ({ card, index, onClick, canEdit, isBlocking, isWarning }: KanbanCardProps) => {
  const priority = priorityConfig[card.priority] || priorityConfig.medium;
  const hasScreenshots = card.screenshots && card.screenshots.length > 0;
  const hasLogs = !!card.logs;
  const hasSummary = !!card.summary;
  const hasPreviewLink = !!card.preview_link;
  const hasReviewEvidence = hasScreenshots || hasLogs || hasSummary || hasPreviewLink;
  const stageInfo = getStageInfo(card.stage);
  const delegation = getDelegationBadge(card.delegation_score || 0);
  const nextAction = getNextAction(card);

  const isCriticalBlocking = isBlocking || card.priority === "critical";
  const isHighWarning = isWarning && card.priority === "high";

  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={!canEdit}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(card)}
          className={cn(
            "bg-card border border-border rounded-lg p-3 mb-2 cursor-pointer transition-all hover:shadow-md",
            snapshot.isDragging && "shadow-lg ring-2 ring-primary/30 rotate-2",
            isCriticalBlocking && "animate-pulse border-destructive bg-destructive/10 ring-1 ring-destructive/30",
            isHighWarning && !isCriticalBlocking && "animate-pulse border-orange-400 bg-orange-500/10 ring-1 ring-orange-400/30"
          )}
        >
          {/* Top row: stage + delegation score */}
          <div className="flex items-center justify-between mb-1.5">
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${stageInfo.color} text-white border-0`}>
              {stageInfo.label.split(" — ")[0]}
            </Badge>
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 font-mono ${delegation.className}`}>
              {delegation.text}
            </Badge>
          </div>

          {/* Priority bar */}
          <div className={`h-1 w-8 rounded-full ${priority.color} mb-2`} />

          {/* Title */}
          <h4 className="text-sm font-semibold text-foreground leading-tight mb-2">
            {card.title}
          </h4>

          {/* Critical next action button */}
          {nextAction && (
            <div className={cn(
              "rounded-md px-2.5 py-1.5 mb-2 border",
              isCriticalBlocking
                ? "bg-destructive/15 border-destructive/30"
                : isHighWarning
                  ? "bg-orange-500/10 border-orange-400/30"
                  : "bg-muted/50 border-border"
            )}>
              <div className={cn(
                "text-[11px] font-bold leading-tight",
                isCriticalBlocking ? "text-destructive" : isHighWarning ? "text-orange-500" : "text-foreground"
              )}>
                ▶ {nextAction.label}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {nextAction.description}
              </div>
            </div>
          )}

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

          {/* Completed date */}
          {card.completed_at && (
            <div className="flex items-center gap-1 text-green-500 mb-1.5">
              <CheckCircle2 className="w-3 h-3" />
              <span className="text-[10px] font-medium">
                Completed {format(new Date(card.completed_at), "MMM d, yyyy")}
              </span>
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
