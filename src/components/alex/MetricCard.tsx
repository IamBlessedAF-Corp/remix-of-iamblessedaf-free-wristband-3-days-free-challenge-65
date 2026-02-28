import { cn } from "@/lib/utils";
import { LucideIcon, ArrowRight, MessageSquare } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  onNavigate?: () => void;
  onAskAlex?: () => void;
  navigateLabel?: string;
  className?: string;
}

export default function MetricCard({
  label, value, subtitle, icon: Icon, trend, onNavigate, onAskAlex, navigateLabel, className,
}: MetricCardProps) {
  return (
    <div className={cn("bg-card border border-border/50 rounded-xl p-4 space-y-3", className)}>
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
            trend === "up" && "bg-emerald-500/10 text-emerald-600",
            trend === "down" && "bg-red-500/10 text-red-600",
            trend === "neutral" && "bg-muted text-muted-foreground",
          )}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex gap-1.5">
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded-md"
          >
            {navigateLabel || "View Details"} <ArrowRight className="w-3 h-3" />
          </button>
        )}
        {onAskAlex && (
          <button
            onClick={onAskAlex}
            className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted px-2 py-1 rounded-md"
          >
            <MessageSquare className="w-3 h-3" /> Ask Alex
          </button>
        )}
      </div>
    </div>
  );
}
