import { useState, useRef } from "react";
import { Draggable } from "@hello-pangea/dnd";
import type { BoardCard, BoardColumn } from "@/hooks/useBoard";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Zap, Star, Image, FileText, ExternalLink, ClipboardList, CheckCircle2, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { getStageInfo } from "./StageSelector";
import { cn } from "@/lib/utils";
import { uploadAndAttachScreenshot } from "@/utils/screenshotUpload";
import { toast } from "sonner";
import { getDelegationBadge, getNextAction } from "@/utils/boardHelpers";

interface KanbanCardProps {
  card: BoardCard;
  index: number;
  onClick: (card: BoardCard) => void;
  canEdit: boolean;
  isBlocking?: boolean;
  isWarning?: boolean;
  columns?: BoardColumn[];
  onAdvance?: (cardId: string, nextColumnId: string) => void;
  onScreenshotAdded?: (cardId: string, screenshots: string[]) => void;
}

const priorityConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  critical: { color: "bg-destructive", icon: <AlertTriangle className="w-3 h-3" /> },
  high: { color: "bg-orange-500", icon: <Zap className="w-3 h-3" /> },
  medium: { color: "bg-primary", icon: <Star className="w-3 h-3" /> },
  low: { color: "bg-muted", icon: <Clock className="w-3 h-3" /> },
};

const KanbanCard = ({ card, index, onClick, canEdit, isBlocking, isWarning, columns, onAdvance, onScreenshotAdded }: KanbanCardProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const priority = priorityConfig[card.priority] || priorityConfig.medium;
  const hasScreenshots = card.screenshots && card.screenshots.length > 0;
  const hasLogs = !!card.logs;
  const hasSummary = !!card.summary;
  const hasPreviewLink = !!card.preview_link;
  const hasReviewEvidence = hasScreenshots || hasLogs || hasSummary || hasPreviewLink;
  const stageInfo = getStageInfo(card.stage);
  const delegation = getDelegationBadge(card.delegation_score || 0);
  const nextAction = getNextAction(card, columns);

  // Determine if this card is in a review/error column and missing screenshots
  const currentCol = columns?.find((c) => c.id === card.column_id);
  const isInReviewColumn = currentCol?.name.includes("🚨 Errors") || currentCol?.name.includes("👀 Review");
  const showCaptureButton = isInReviewColumn && !hasScreenshots && canEdit;

  const isCriticalBlocking = isBlocking || card.priority === "critical";
  const isHighWarning = isWarning && card.priority === "high";
  const isCredentialBlocked = currentCol?.name.includes("🔑 Needed Credentials") || card.labels?.includes("credentials-blocked");

  const handleAdvanceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nextAction?.nextColumnId && onAdvance && canEdit) {
      onAdvance(card.id, nextAction.nextColumnId);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;
    setUploading(true);
    try {
      const result = await uploadAndAttachScreenshot(file, card.id, card.screenshots || [], "proof");
      if (result) {
        toast.success("📸 Screenshot uploaded!");
        onScreenshotAdded?.(card.id, result.screenshots);
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Screenshot upload error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
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
            isCredentialBlocked && "credential-blocked-blink border-red-600 bg-red-600/15 ring-2 ring-red-500/50",
            !isCredentialBlocked && isCriticalBlocking && "animate-pulse border-destructive bg-destructive/10 ring-1 ring-destructive/30",
            !isCredentialBlocked && isHighWarning && !isCriticalBlocking && "animate-pulse border-orange-400 bg-orange-500/10 ring-1 ring-orange-400/30"
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

          {/* Credential blocked banner */}
          {isCredentialBlocked && (
            <div className="flex items-center gap-1.5 px-2 py-1 mb-2 rounded bg-red-600/20 border border-red-500/40">
              <span className="text-sm">🔑</span>
              <span className="text-[10px] font-bold text-red-400">BLOCKED — Credentials Required</span>
            </div>
          )}

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

          {/* Upload proof screenshot for review/error cards missing screenshots */}
          {showCaptureButton && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={handleUploadClick}
                disabled={uploading}
                className={cn(
                  "w-full flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 mb-2 border text-[11px] font-medium transition-all",
                  "border-dashed border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10",
                  uploading && "opacity-60 cursor-wait"
                )}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" /> 📸 Upload Proof Screenshot
                  </>
                )}
              </button>
            </>
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
