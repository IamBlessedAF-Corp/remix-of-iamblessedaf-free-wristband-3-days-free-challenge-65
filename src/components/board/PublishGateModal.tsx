import { useState } from "react";
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

const PublishGateModal = ({ card, open, onClose, onConfirm }: PublishGateModalProps) => {
  if (!card) return null;

  const checks: CheckItem[] = [
    {
      label: "Screenshots attached",
      passed: (card.screenshots?.length ?? 0) > 0,
      icon: <Camera className="w-4 h-4" />,
      detail: card.screenshots?.length
        ? `${card.screenshots.length} screenshot(s)`
        : "No screenshots — add visual proof",
    },
    {
      label: "Preview link set",
      passed: !!card.preview_link?.trim(),
      icon: <Link2 className="w-4 h-4" />,
      detail: card.preview_link || "No preview link — add the route/URL",
    },
    {
      label: "Logs / change summary",
      passed: !!card.logs?.trim(),
      icon: <FileText className="w-4 h-4" />,
      detail: card.logs ? `${card.logs.slice(0, 80)}…` : "No logs — document what changed",
    },
    {
      label: "Summary written",
      passed: !!card.summary?.trim(),
      icon: <ClipboardList className="w-4 h-4" />,
      detail: card.summary ? `${card.summary.slice(0, 80)}…` : "No summary — describe the outcome",
    },
  ];

  const allPassed = checks.every((c) => c.passed);
  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Publish Gate — Ready to Go Live?
          </DialogTitle>
          <DialogDescription className="text-xs">
            Moving <strong>"{card.title}"</strong> to ✅ Done marks it as production-ready.
            Verify evidence before publishing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-2">
          {checks.map((check) => (
            <div
              key={check.label}
              className={`flex items-start gap-3 p-2.5 rounded-lg border ${
                check.passed
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-destructive/30 bg-destructive/5"
              }`}
            >
              <div className="mt-0.5">
                {check.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {check.icon}
                  <span className="text-sm font-medium">{check.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={allPassed ? "default" : "destructive"} className="text-[10px]">
            {passedCount}/{checks.length} checks
          </Badge>
          {allPassed
            ? "All checks passed — safe to publish!"
            : "Some checks failed. You can still proceed, but evidence is incomplete."}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Go Back & Fix
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            variant={allPassed ? "default" : "destructive"}
            className="gap-1.5"
          >
            {allPassed ? (
              <>
                <Rocket className="w-3.5 h-3.5" /> Move to Done & Publish
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" /> Move Anyway
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishGateModal;
