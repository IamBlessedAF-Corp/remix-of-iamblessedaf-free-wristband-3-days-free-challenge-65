import { Trophy, Lock, CheckCircle, Calendar, TrendingUp, Video, Eye, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  totalViews: number;
  avgViewsPerWeek: number;
  clipsThisWeek?: number;
  viewsThisWeek?: number;
}

const TIERS = [
  { views: 100_000, bonus: 111, label: "Verified Clipper" },
  { views: 500_000, bonus: 444, label: "Proven Clipper" },
  { views: 1_000_000, bonus: 1111, label: "Super Clipper" },
];

/* ── Sprint Segmentation ── */
const SPRINTS = [
  { id: 1, target: 25000, label: "Sprint 1", range: "0 → 25k" },
  { id: 2, target: 50000, label: "Sprint 2", range: "25k → 50k" },
  { id: 3, target: 75000, label: "Sprint 3", range: "50k → 75k" },
  { id: 4, target: 100000, label: "Sprint 4", range: "75k → 100k", unlock: "$111" },
];

/* Front-loaded visual weighting: first sprint occupies ~34% of bar width */
const SPRINT_WEIGHTS = [0.34, 0.26, 0.22, 0.18];

const getSprintFill = (sprintIndex: number, totalViews: number) => {
  const start = sprintIndex * 25000;
  const end = (sprintIndex + 1) * 25000;
  if (totalViews >= end) return 100;
  if (totalViews <= start) return 0;
  return ((totalViews - start) / 25000) * 100;
};

const REINFORCEMENT_LINES = [
  "You're building real momentum.",
  "Every clip stacks. Keep going.",
  "Your velocity is what unlocks bonuses.",
  "Consistency beats virality. You're on track.",
];

const ClipperBonusLadder = ({ totalViews, avgViewsPerWeek, clipsThisWeek = 0, viewsThisWeek = 0 }: Props) => {
  const nextTierIdx = TIERS.findIndex((t) => totalViews < t.views);
  const nextTier = nextTierIdx >= 0 ? TIERS[nextTierIdx] : null;
  const remaining = nextTier ? Math.max(0, nextTier.views - totalViews) : 0;
  const pct = nextTier ? Math.min(100, (totalViews / nextTier.views) * 100) : 100;

  // ETA calculation
  const etaWeeks = nextTier && avgViewsPerWeek > 0 ? Math.ceil(remaining / avgViewsPerWeek) : null;
  const etaLabel = etaWeeks !== null
    ? etaWeeks <= 1 ? "~this week" : etaWeeks <= 4 ? `~${etaWeeks} weeks` : `~${Math.round(etaWeeks / 4)} months`
    : null;

  // Pick reinforcement line based on clips this week
  const reinforcement = clipsThisWeek >= 5
    ? REINFORCEMENT_LINES[3]
    : clipsThisWeek >= 3
    ? REINFORCEMENT_LINES[0]
    : clipsThisWeek >= 1
    ? REINFORCEMENT_LINES[1]
    : REINFORCEMENT_LINES[2];

  // Only show sprint section for first 100k tier
  const showSprints = totalViews < 100_000;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-foreground mb-1">Bonus Progress</h3>
        <p className="text-xs text-muted-foreground">
          Lifetime views — bonuses stack on top of per-clip pay.
        </p>
      </div>

      {/* ── 1) Momentum Header ── */}
      <div className="bg-secondary/40 rounded-xl p-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">Your Velocity This Week</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <div className="bg-card/60 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Video className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Clips posted</span>
            </div>
            <p className="text-base font-bold text-foreground">{clipsThisWeek}</p>
          </div>
          <div className="bg-card/60 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Eye className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Views added</span>
            </div>
            <p className="text-base font-bold text-foreground">{viewsThisWeek.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-[11px] text-primary font-medium flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {reinforcement}
        </p>
      </div>

      {/* ── 2 & 3) Sprint Segmentation + Front-Loaded Progress (first 100k only) ── */}
      {showSprints && (
        <div className="bg-secondary/30 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">Path to $111 Bonus</span>
            <span className="text-[10px] text-muted-foreground">4 sprints · 25k each</span>
          </div>

          {/* Combined visual bar */}
          <div className="flex h-2.5 rounded-full overflow-hidden bg-secondary mb-2.5">
            {SPRINTS.map((sprint, i) => {
              const fill = getSprintFill(i, totalViews);
              const widthPct = SPRINT_WEIGHTS[i] * 100;
              return (
                <div
                  key={sprint.id}
                  className="relative h-full"
                  style={{ width: `${widthPct}%` }}
                >
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${fill}%` }}
                  />
                  {i < 3 && (
                    <div className="absolute right-0 top-0 bottom-0 w-px bg-border/60" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Sprint cards */}
          <div className="grid grid-cols-4 gap-1">
            {SPRINTS.map((sprint, i) => {
              const fill = getSprintFill(i, totalViews);
              const isCurrent = fill > 0 && fill < 100;
              const isDone = fill >= 100;
              const isNext = !isDone && !isCurrent && i === SPRINTS.findIndex((_, si) => getSprintFill(si, totalViews) < 100);

              return (
                <div
                  key={sprint.id}
                  className={`rounded-lg p-1.5 text-center transition-all ${
                    isCurrent
                      ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
                      : isDone
                      ? "bg-primary/5 border border-primary/20"
                      : isNext
                      ? "bg-secondary/80 border border-border/50"
                      : "bg-secondary/40 border border-transparent"
                  }`}
                >
                  <p className="text-[9px] font-bold text-muted-foreground">{sprint.label}</p>
                  <p className="text-[9px] text-muted-foreground">{sprint.range}</p>
                  {sprint.unlock && (
                    <p className="text-[9px] font-bold text-primary mt-0.5">🔓 {sprint.unlock}</p>
                  )}
                  {isDone && <p className="text-[9px] text-primary mt-0.5">✓</p>}
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Focus on the current sprint — just finish the next 25k.
          </p>
        </div>
      )}

      {/* ── Overall tier progress ── */}
      {nextTier && (
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">{totalViews.toLocaleString()} views</span>
            <span className="font-bold text-primary">{nextTier.views.toLocaleString()}</span>
          </div>
          <Progress value={pct} className="h-3 bg-secondary" />
          <p className="text-xs text-primary font-semibold mt-2">
            {remaining.toLocaleString()} views to unlock ${nextTier.bonus}
          </p>
          {etaLabel && (
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              At your pace: {etaLabel}
            </p>
          )}
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
