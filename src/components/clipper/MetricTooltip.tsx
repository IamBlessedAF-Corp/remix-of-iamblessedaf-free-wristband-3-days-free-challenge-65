import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MetricTooltipProps {
  label: string;
  value: string | number;
  required?: string | number;
  description: string;
  whyItMatters: string;
  howToImprove: string;
  status?: "passing" | "failing" | "neutral";
  children?: React.ReactNode;
}

const statusStyles = {
  passing: "text-emerald-400 decoration-emerald-400",
  failing: "text-destructive decoration-destructive",
  neutral: "text-primary decoration-primary",
};

const MetricTooltip = ({
  label,
  value,
  required,
  description,
  whyItMatters,
  howToImprove,
  status = "neutral",
  children,
}: MetricTooltipProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              role="button"
              tabIndex={0}
              onClick={() => setExpanded(true)}
              className={`inline font-bold underline underline-offset-2 cursor-pointer hover:opacity-80 transition-all animate-pulse hover:animate-none ${statusStyles[status]}`}
            >
              {children || label}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[320px]">
            <div className="space-y-2">
              <p className="text-sm font-black text-popover-foreground">{label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">Current:</span>
                <span className={`font-bold ${status === "passing" ? "text-emerald-400" : status === "failing" ? "text-destructive" : "text-popover-foreground"}`}>
                  {value}
                </span>
                {required && (
                  <>
                    <span className="text-muted-foreground">Required:</span>
                    <span className="font-bold text-popover-foreground">{required}</span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-primary italic">Tap for details →</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${status === "passing" ? "bg-emerald-400" : status === "failing" ? "bg-destructive" : "bg-primary"}`} />
              {label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">What it means</p>
              <p className="text-sm text-foreground leading-relaxed">{description}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Why it matters</p>
              <p className="text-sm text-foreground leading-relaxed">{whyItMatters}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Current</p>
                  <p className={`text-lg font-bold ${status === "passing" ? "text-emerald-400" : status === "failing" ? "text-destructive" : "text-foreground"}`}>
                    {value}
                  </p>
                </div>
                {required && (
                  <div>
                    <p className="text-[10px] text-muted-foreground">Required</p>
                    <p className="text-lg font-bold text-foreground">{required}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">How to improve</p>
              <p className="text-sm text-primary leading-relaxed font-medium">{howToImprove}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MetricTooltip;
