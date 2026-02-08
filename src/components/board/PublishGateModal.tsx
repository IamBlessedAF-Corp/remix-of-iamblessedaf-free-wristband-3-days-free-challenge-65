import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Camera,
  Link2,
  FileText,
  ClipboardList,
  Rocket,
  AlertTriangle,
} from "lucide-react";
import type { BoardCard } from "@/hooks/useBoard";

interface PublishGateModalProps {
  card: BoardCard | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

interface CheckItem {
  label: string;
  passed: boolean;
  icon: React.ReactNode;
  detail: string;
}

/** Extract a short readable path from a URL or return as-is */
function shortenUrl(url: string): string {
  try {
    const u = new URL(url, "https://placeholder.dev");
    return u.pathname || url;
  } catch {
    return url.length > 40 ? url.slice(0, 37) + "…" : url;
  }
}

const PublishGateModal = ({ card, open, onClose, onConfirm }: PublishGateModalProps) => {
  if (!card) return null;

  const checks: CheckItem[] = [
    {
      label: "Screenshots attached",
      passed: (card.screenshots?.length ?? 0) > 0,
      icon: <Camera className="w-4 h-4 shrink-0" />,
      detail: card.screenshots?.length
        ? `${card.screenshots.length} screenshot(s) uploaded`
        : "No screenshots — add visual proof",
    },
    {
      label: "Preview link set",
      passed: !!card.preview_link?.trim(),
      icon: <Link2 className="w-4 h-4 shrink-0" />,
      detail: card.preview_link
        ? shortenUrl(card.preview_link)
        : "No preview link — add the route/URL",
    },
    {
      label: "Logs / change summary",
      passed: !!card.logs?.trim(),
      icon: <FileText className="w-4 h-4 shrink-0" />,
      detail: card.logs
        ? card.logs.replace(/\[.*?\]\s*/g, "").slice(0, 60).trim() + "…"
        : "No logs — document what changed",
    },
    {
      label: "Summary written",
      passed: !!card.summary?.trim(),
      icon: <ClipboardList className="w-4 h-4 shrink-0" />,
      detail: card.summary
        ? card.summary.replace(/^✅\s*VERIFIED[^:]*:\s*/i, "").slice(0, 60).trim() + "…"
        : "No summary — describe the outcome",
    },
  ];

  const allPassed = checks.every((c) => c.passed);
  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-4 sm:p-6 gap-3">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Rocket className="w-4 h-4 text-primary shrink-0" />
            Publish Gate
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Moving <strong className="text-foreground">"{card.title}"</strong> to Done.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          {checks.map((check) => (
            <div
              key={check.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors ${
                check.passed
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                  : "border-destructive/20 bg-destructive/5"
              }`}
            >
              {check.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {check.icon}
                  <span className="text-xs font-medium truncate">{check.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate leading-tight">
                  {check.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Badge
            variant={allPassed ? "outline" : "destructive"}
            className={`text-[10px] px-1.5 py-0.5 ${
              allPassed ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/40" : ""
            }`}
          >
            {passedCount}/{checks.length}
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            {allPassed ? "All checks passed — safe to publish!" : "Evidence incomplete."}
          </span>
        </div>

        <DialogFooter className="flex-row gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1 text-xs h-8">
            Go Back & Fix
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className={`flex-1 gap-1.5 text-xs h-8 ${
              allPassed
                ? "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            }`}
          >
            {allPassed ? (
              <>
                <Rocket className="w-3 h-3" /> Move to Done
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3" /> Move Anyway
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishGateModal;
