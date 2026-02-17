import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Lock, CheckCircle, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import MetricTooltip from "./MetricTooltip";

interface Props {
  userId: string;
  totalLifetimeViews: number;
}

const BONUS_TIERS = [
  { views: 100_000, bonus: 111, label: "Verified Bonus", tier: "verified" },
  { views: 500_000, bonus: 444, label: "Proven Bonus", tier: "proven" },
  { views: 1_000_000, bonus: 1111, label: "Super Bonus", tier: "super" },
];

const MonthlyBonusTracker = ({ userId, totalLifetimeViews }: Props) => {
  const [monthlyViews, setMonthlyViews] = useState(0);
  const [lifetimeViews, setLifetimeViews] = useState(totalLifetimeViews);

  useEffect(() => {
    // Calculate monthly views from clip_submissions
    const now = new Date();
    const monthStart = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
    monthStart.setUTCHours(0, 0, 0, 0);

    supabase
      .from("clip_submissions")
      .select("view_count, baseline_view_count")
      .eq("user_id", userId)
      .gte("submitted_at", monthStart.toISOString())
      .then(({ data }) => {
        if (data) {
          const views = data.reduce(
            (s, c) => s + Math.max(0, (c.view_count || 0) - (c.baseline_view_count || 0)),
            0
          );
          setMonthlyViews(views);
        }
      });
  }, [userId]);

  const currentMonthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const nextTierIdx = BONUS_TIERS.findIndex((t) => monthlyViews < t.views);
  const nextTier = nextTierIdx >= 0 ? BONUS_TIERS[nextTierIdx] : null;
  const remaining = nextTier ? Math.max(0, nextTier.views - monthlyViews) : 0;
  const pct = nextTier ? Math.min(100, (monthlyViews / nextTier.views) * 100) : 100;

  // Days left in month
  const now = new Date();
  const lastDay = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0);
  const daysLeft = lastDay.getUTCDate() - now.getUTCDate();

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Monthly Bonus</h3>
          <p className="text-xs text-muted-foreground">{currentMonthName} · {daysLeft} days left</p>
        </div>
        <MetricTooltip
          label="Monthly Bonus"
          value={`${monthlyViews.toLocaleString()} views`}
          description="Your total net views across ALL clips this calendar month. Resets on the 1st."
          whyItMatters="Monthly bonuses ($111–$1,111) stack ON TOP of your per-clip RPM earnings. The more views you accumulate this month, the bigger the bonus."
          howToImprove="Post consistently (3+ clips/day). Repurpose top clips across platforms. Target trending sounds."
          status={nextTierIdx === -1 ? "passing" : "neutral"}
        >
          <Trophy className="w-5 h-5 text-primary" />
        </MetricTooltip>
      </div>

      {/* Monthly progress */}
      {nextTier && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">{monthlyViews.toLocaleString()} monthly views</span>
            <span className="font-bold text-primary">{nextTier.views.toLocaleString()}</span>
          </div>
          <Progress value={pct} className="h-3 bg-secondary" />
          <p className="text-[11px] text-primary font-semibold mt-1.5">
            {remaining.toLocaleString()} views → ${nextTier.bonus} bonus
          </p>
        </div>
      )}

      {/* Tier cards */}
      <div className="space-y-2">
        {BONUS_TIERS.map((tier, i) => {
          const unlocked = monthlyViews >= tier.views;
          const isNext = i === nextTierIdx;
          return (
            <div
              key={tier.views}
              className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${
                unlocked
                  ? "bg-primary/10 border-primary/30"
                  : isNext
                  ? "bg-secondary/80 border-primary/20"
                  : "bg-secondary/30 border-border/30 opacity-60"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                unlocked ? "bg-primary/20" : "bg-secondary"
              }`}>
                {unlocked ? (
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
                  {tier.views.toLocaleString()} monthly views → ${tier.bonus}
                </p>
              </div>
              {unlocked && <span className="text-xs font-bold text-primary">✓</span>}
            </div>
          );
        })}
      </div>

      {/* Lifetime tracker */}
      <div className="bg-secondary/30 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Lifetime views</span>
          </div>
          <span className="text-sm font-bold text-foreground">{lifetimeViews.toLocaleString()}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Monthly counter resets on the 1st. Lifetime is tracked separately.
        </p>
      </div>
    </div>
  );
};

export default MonthlyBonusTracker;
