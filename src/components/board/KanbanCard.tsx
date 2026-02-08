import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import type { BoardCard, BoardColumn } from "@/hooks/useBoard";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Zap, Star, Image, FileText, ExternalLink, ClipboardList, CheckCircle2, Camera, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { getStageInfo } from "./StageSelector";
import { cn } from "@/lib/utils";
import { autoCaptureForCard } from "@/utils/screenshotCapture";
import { toast } from "sonner";

interface KanbanCardProps {
  card: BoardCard;
  index: number;
  onClick: (card: BoardCard) => void;
  canEdit: boolean;
  isBlocking?: boolean;
  isWarning?: boolean;
  columns?: BoardColumn[];
  onAdvance?: (cardId: string, nextColumnId: string) => void;
}

const priorityConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  critical: { color: "bg-destructive", icon: <AlertTriangle className="w-3 h-3" /> },
  high: { color: "bg-orange-500", icon: <Zap className="w-3 h-3" /> },
  medium: { color: "bg-primary", icon: <Star className="w-3 h-3" /> },
  low: { color: "bg-muted", icon: <Clock className="w-3 h-3" /> },
};

function getDelegationBadge(score: number) {
  if (score >= 70) return { text: `D:${score.toFixed(0)}`, className: "bg-green-500/20 text-green-400 border-green-500/40" };
  if (score >= 40) return { text: `D:${score.toFixed(0)}`, className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40" };
  return { text: `D:${score.toFixed(0)}`, className: "bg-red-500/20 text-red-400 border-red-500/40" };
}

/** Map column position to next-action label & description */
function getNextAction(
  card: BoardCard,
  columns?: BoardColumn[]
): { label: string; description: string; nextColumnId: string | null } | null {
  if (!columns || columns.length === 0) return null;

  const currentCol = columns.find((c) => c.id === card.column_id);
  if (!currentCol) return null;

  const sorted = [...columns].sort((a, b) => a.position - b.position);
  const currentIdx = sorted.findIndex((c) => c.id === currentCol.id);
  const nextCol = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  // Don't show action for the Done column
  if (currentCol.name.includes("✅ Done")) return null;

  const nextColumnId = nextCol?.id ?? null;

  // Derive action label from current column context
  if (currentCol.name.includes("Ideas"))
    return { label: "→ Send to Backlog", description: "Queue for prioritization", nextColumnId };
  if (currentCol.name.includes("Backlog"))
    return { label: "→ Clarify Scope", description: "Define requirements & acceptance criteria", nextColumnId };
  if (currentCol.name.includes("Clarification"))
    return { label: "→ Start Today", description: "Move to today's work queue", nextColumnId };
  if (currentCol.name.includes("Today"))
    return { label: "→ Begin Work", description: "Start active execution", nextColumnId };
  if (currentCol.name.includes("Work in Progress"))
    return { label: "→ Security Check", description: "Submit for security review", nextColumnId };
  if (currentCol.name.includes("Security"))
    return { label: "→ Validate", description: "Push to validation queue", nextColumnId };
  if (currentCol.name.includes("Credentials"))
    return { label: "→ Validate", description: "Credentials ready — validate", nextColumnId };
  if (currentCol.name.includes("Validation (New)"))
    return { label: "→ System Validate", description: "Run automated checks", nextColumnId };
  if (currentCol.name.includes("Validation (System)"))
    return { label: "→ Review", description: "Submit for final review", nextColumnId };
  if (currentCol.name.includes("Errors"))
    return { label: "→ Back to Review", description: "Fix applied — re-review", nextColumnId };
  if (currentCol.name.includes("👀 Review"))
    return { label: "→ Mark Done ✅", description: "Approve and complete", nextColumnId };
  if (currentCol.name.includes("3 Outcomes"))
    return { label: "→ Ideate", description: "Break into actionable ideas", nextColumnId };

  return { label: "→ Advance", description: "Move to next stage", nextColumnId };
}

const KanbanCard = ({ card, index, onClick, canEdit, isBlocking, isWarning, columns, onAdvance }: KanbanCardProps) => {
  const [capturing, setCapturing] = useState(false);
  const priority = priorityConfig[card.priority] || priorityConfig.medium;
  const hasScreenshots = card.screenshots && card.screenshots.length > 0;
  const hasLogs = !!card.logs;
  const hasSummary = !!card.summary;
  const hasPreviewLink = !!card.preview_link;
  const hasReviewEvidence = hasScreenshots || hasLogs || hasSummary || hasPreviewLink;
  const stageInfo = getStageInfo(card.stage);
  const delegation = getDelegationBadge(card.delegation_score || 0);
  const nextAction = getNextAction(card, columns);

  const isCriticalBlocking = isBlocking || card.priority === "critical";
  const isHighWarning = isWarning && card.priority === "high";

  // Determine if this card is in a review/error column and missing screenshots
  const currentCol = columns?.find((c) => c.id === card.column_id);
  const isInReviewColumn = currentCol?.name.includes("🚨 Errors") || currentCol?.name.includes("👀 Review");
  const showCaptureButton = isInReviewColumn && !hasScreenshots && canEdit;

  const handleAdvanceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextAction?.nextColumnId && onAdvance && canEdit) {
      onAdvance(card.id, nextAction.nextColumnId);
    }
  };

  const handleManualCapture = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (capturing) return;
    setCapturing(true);
    try {
      const url = await autoCaptureForCard(card.id, card.title, card.screenshots || [], "manual");
      if (url) {
        toast.success("📸 Screenshot captured successfully!");
      } else {
        toast.error("Failed to capture screenshot");
      }
    } catch {
      toast.error("Screenshot capture error");
    } finally {
      setCapturing(false);
    }
  };

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
            <button
              onClick={handleAdvanceClick}
              disabled={!canEdit || !nextAction.nextColumnId}
              className={cn(
                "w-full text-left rounded-md px-2.5 py-1.5 mb-2 border transition-all",
                canEdit && nextAction.nextColumnId
                  ? "cursor-pointer hover:brightness-110 active:scale-[0.98]"
                  : "cursor-default opacity-60",
                isCriticalBlocking
                  ? "bg-destructive/15 border-destructive/30 hover:bg-destructive/25"
                  : isHighWarning
                    ? "bg-orange-500/10 border-orange-400/30 hover:bg-orange-500/20"
                    : "bg-muted/50 border-border hover:bg-muted"
              )}
            >
              <div className={cn(
                "text-[11px] font-bold leading-tight",
                isCriticalBlocking ? "text-destructive" : isHighWarning ? "text-orange-500" : "text-foreground"
              )}>
                ▶ {nextAction.label}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {nextAction.description}
              </div>
            </button>
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

          {/* Manual capture button for review/error cards missing screenshots */}
          {showCaptureButton && (
            <button
              onClick={handleManualCapture}
              disabled={capturing}
              className={cn(
                "w-full flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 mb-2 border text-[11px] font-medium transition-all",
                "border-dashed border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10",
                capturing && "opacity-60 cursor-wait"
              )}
            >
              {capturing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> Capturing…
                </>
              ) : (
                <>
                  <Camera className="w-3 h-3" /> 📸 Capture Proof Screenshot
                </>
              )}
            </button>
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
