import { Video, Eye, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  clipsThisWeek: number;
  viewsThisWeek: number;
  earningsThisWeekCents: number;
}

const WEEKLY_TARGET = 10;

const ClipperWeeklySnapshot = ({ clipsThisWeek, viewsThisWeek, earningsThisWeekCents }: Props) => {
  const pct = Math.min(100, (clipsThisWeek / WEEKLY_TARGET) * 100);
  const remaining = Math.max(0, WEEKLY_TARGET - clipsThisWeek);

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-1">This Week</h3>
      <p className="text-xs text-muted-foreground mb-4">Just finish the week.</p>

      {/* Clips progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Video className="w-4 h-4" />
            Clips posted
          </span>
          <span className="font-bold text-foreground">{clipsThisWeek} / {WEEKLY_TARGET}</span>
        </div>
        <div className="relative">
          <Progress value={pct} className="h-3 bg-secondary" />
          {pct >= 100 && (
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-primary-foreground">
              ✅ DONE
            </span>
          )}
        </div>
        {remaining > 0 && (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {remaining} more to hit your weekly target
          </p>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Views</span>
          </div>
          <p className="text-lg font-bold text-foreground">{viewsThisWeek.toLocaleString()}</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Earned</span>
          </div>
          <p className="text-lg font-bold text-foreground">${(earningsThisWeekCents / 100).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default ClipperWeeklySnapshot;
