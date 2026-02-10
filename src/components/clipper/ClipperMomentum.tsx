import { TrendingUp, Flame, Zap } from "lucide-react";

interface Props {
  clipsThisWeek: number;
  clipsLastWeek: number;
  streakDays: number;
  totalClips: number;
}

const ClipperMomentum = ({ clipsThisWeek, clipsLastWeek, streakDays, totalClips }: Props) => {
  const signals: { icon: any; text: string; highlight?: boolean }[] = [];

  if (streakDays >= 2) {
    signals.push({ icon: Flame, text: `${streakDays}-day posting streak 🔥`, highlight: true });
  }

  if (clipsLastWeek > 0 && clipsThisWeek > clipsLastWeek) {
    signals.push({ icon: TrendingUp, text: "You're ahead of last week" });
  } else if (clipsLastWeek > 0 && clipsThisWeek === clipsLastWeek) {
    signals.push({ icon: TrendingUp, text: "Matching last week's pace" });
  }

  if (totalClips >= 10) {
    signals.push({ icon: Zap, text: `${totalClips} clips submitted — keep stacking` });
  } else if (totalClips >= 3) {
    signals.push({ icon: Zap, text: "You're building real momentum" });
  }

  if (signals.length === 0) {
    signals.push({ icon: Zap, text: "Post your first clip to start building momentum" });
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-3">Momentum</h3>
      <div className="space-y-2.5">
        {signals.map((signal, i) => {
          const Icon = signal.icon;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl p-3 ${
                signal.highlight ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${signal.highlight ? "text-primary" : "text-muted-foreground"}`} />
              <p className={`text-sm ${signal.highlight ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {signal.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClipperMomentum;
