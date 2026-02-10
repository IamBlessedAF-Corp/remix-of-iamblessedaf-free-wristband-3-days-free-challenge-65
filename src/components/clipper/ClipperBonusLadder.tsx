import { Trophy, Lock, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  totalViews: number;
}

const TIERS = [
  { views: 100_000, bonus: 111, label: "Verified Clipper" },
  { views: 500_000, bonus: 444, label: "Proven Clipper" },
  { views: 1_000_000, bonus: 1111, label: "Super Clipper" },
];

const ClipperBonusLadder = ({ totalViews }: Props) => {
  // Find the next uncompleted tier
  const nextTierIdx = TIERS.findIndex((t) => totalViews < t.views);
  const nextTier = nextTierIdx >= 0 ? TIERS[nextTierIdx] : null;
  const remaining = nextTier ? Math.max(0, nextTier.views - totalViews) : 0;
  const pct = nextTier ? Math.min(100, (totalViews / nextTier.views) * 100) : 100;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-1">Bonus Progress</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Lifetime views — bonuses stack on top of per-clip pay.
      </p>

      {/* Current progress toward next tier */}
      {nextTier && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">{totalViews.toLocaleString()} views</span>
            <span className="font-bold text-primary">{nextTier.views.toLocaleString()}</span>
          </div>
          <Progress value={pct} className="h-3 bg-secondary" />
          <p className="text-xs text-primary font-semibold mt-2">
            {remaining.toLocaleString()} views to unlock ${nextTier.bonus}
          </p>
        </div>
      )}

      {/* Tier cards */}
      <div className="space-y-2.5">
        {TIERS.map((tier, i) => {
          const completed = totalViews >= tier.views;
          const isNext = i === nextTierIdx;
          return (
            <div
              key={tier.views}
              className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${
                completed
                  ? "bg-primary/10 border-primary/30"
                  : isNext
                  ? "bg-secondary/80 border-primary/20"
                  : "bg-secondary/30 border-border/30 opacity-60"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                completed ? "bg-primary/20" : "bg-secondary"
              }`}>
                {completed ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : isNext ? (
                  <Trophy className="w-4 h-4 text-primary" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{tier.label}</p>
                <p className="text-[11px] text-muted-foreground">
                  {tier.views.toLocaleString()} views → ${tier.bonus} bonus
                </p>
              </div>
              {completed && (
                <span className="text-xs font-bold text-primary">Unlocked</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClipperBonusLadder;
