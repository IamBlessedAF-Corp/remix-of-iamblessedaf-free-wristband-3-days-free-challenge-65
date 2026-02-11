import { motion } from "framer-motion";
import { Trophy, Target, Star, Zap, TrendingUp, Video, Eye } from "lucide-react";

/* ── Sprint Segmentation ── */
const sprints = [
  { id: 1, target: 25000, label: "Sprint 1", range: "0 → 25k" },
  { id: 2, target: 50000, label: "Sprint 2", range: "25k → 50k" },
  { id: 3, target: 75000, label: "Sprint 3", range: "50k → 75k" },
  { id: 4, target: 100000, label: "Sprint 4", range: "75k → 100k", unlock: "$111" },
];

/* ── Bonus tiers (unchanged logic) ── */
const tiers = [
  {
    icon: Target,
    views: "100,000",
    bonus: "$111",
    label: "Your First Payday",
    note: "Post 10 clips/week at 10k avg → you unlock this in just 10 weeks. Most clippers get here before month 3.",
    active: true,
  },
  {
    icon: Star,
    views: "500,000",
    bonus: "$444",
    label: "Momentum Builder",
    note: "Keep posting consistently — one clip breaking 50k+ can accelerate this dramatically.",
    active: false,
  },
  {
    icon: Trophy,
    views: "1,000,000",
    bonus: "$1,111",
    label: "Super Payout",
    note: "Cumulative across ALL clips. No single video needs to go viral — just keep stacking views.",
    active: false,
  },
];

/* ── Front-loaded visual weighting ──
   Sprint 1 visually occupies ~34% of the bar width,
   Sprint 2 ~26%, Sprint 3 ~22%, Sprint 4 ~18%.
   Actual internal percentages remain mathematically accurate. */
const sprintVisualWeights = [0.34, 0.26, 0.22, 0.18];

const getSprintFill = (sprintIndex: number, totalViews: number) => {
  const sprintStart = sprintIndex * 25000;
  const sprintEnd = (sprintIndex + 1) * 25000;
  if (totalViews >= sprintEnd) return 100;
  if (totalViews <= sprintStart) return 0;
  return ((totalViews - sprintStart) / 25000) * 100;
};

/* ── Example "this week" values for the campaign page (static) ── */
const EXAMPLE_CLIPS_WEEK = 3;
const EXAMPLE_VIEWS_WEEK = 8400;

const reinforcementLines = [
  "You're building real momentum.",
  "Every clip stacks. Keep going.",
  "Your velocity is what unlocks bonuses.",
  "Consistency beats virality. You're on track.",
];

const BonusLadder = () => {
  /* On the campaign page, we use illustrative data (0 views) to show the sprint UI.
     The actual dashboard has real data via useClipperDashboard. */
  const illustrativeViews = 0;
  const reinforcement = reinforcementLines[0];

  return (
    <motion.section
      className="px-4 py-10 max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <h2 className="text-2xl font-bold mb-1">Bonus Ladder — Stack As You Grow</h2>
      <p className="text-sm text-muted-foreground mb-6">
        One-time bonuses on top of your per-clip earnings. Cumulative lifetime views — nothing resets.
      </p>

      {/* ── 1) Momentum Header ── */}
      <div className="bg-card border border-border/50 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground uppercase tracking-wide">Your Velocity This Week</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Video className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Clips posted</span>
            </div>
            <p className="text-lg font-bold text-foreground">{EXAMPLE_CLIPS_WEEK}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Views added</span>
            </div>
            <p className="text-lg font-bold text-foreground">{EXAMPLE_VIEWS_WEEK.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-xs text-primary font-medium flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          {reinforcement}
        </p>
      </div>

      {/* ── 2 & 3) Sprint Segmentation + Front-Loaded Progress Bar ── */}
      <div className="bg-card border border-border/50 rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wide">Path to $111 Bonus</span>
          <span className="text-[11px] text-muted-foreground">4 sprints · 25k views each</span>
        </div>

        {/* Combined visual bar */}
        <div className="flex h-3 rounded-full overflow-hidden bg-secondary mb-3">
          {sprints.map((sprint, i) => {
            const fill = getSprintFill(i, illustrativeViews);
            const widthPct = sprintVisualWeights[i] * 100;
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
        <div className="grid grid-cols-4 gap-1.5">
          {sprints.map((sprint, i) => {
            const fill = getSprintFill(i, illustrativeViews);
            const isCurrentSprint = fill > 0 && fill < 100;
            const isCompleted = fill >= 100;
            const isNext = i === 0 && fill === 0;

            return (
              <div
                key={sprint.id}
                className={`rounded-lg p-2 text-center transition-all ${
                  isCurrentSprint
                    ? "bg-primary/10 border border-primary/30 ring-1 ring-primary/20"
                    : isCompleted
                    ? "bg-primary/5 border border-primary/20"
                    : isNext
                    ? "bg-secondary/80 border border-border/50"
                    : "bg-secondary/40 border border-transparent"
                }`}
              >
                <p className="text-[10px] font-bold text-muted-foreground mb-0.5">
                  {sprint.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{sprint.range}</p>
                {sprint.unlock && (
                  <p className="text-[10px] font-bold text-primary mt-1">
                    🔓 {sprint.unlock}
                  </p>
                )}
                {isCompleted && (
                  <p className="text-[10px] text-primary mt-0.5">✓ Done</p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground mt-3 text-center">
          Focus on the current sprint — don't think about 100k. Just finish the next 25k.
        </p>
      </div>

      {/* ── Original Bonus Tiers ── */}
      <div className="relative space-y-4">
        <div className="absolute left-[22px] top-4 bottom-4 w-px bg-border hidden md:block" />

        {tiers.map((tier, i) => {
          const Icon = tier.icon;
          return (
            <motion.div
              key={tier.views}
              className={`relative flex items-start gap-4 rounded-xl border p-5 ${
                tier.active
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/50 bg-card"
              }`}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`shrink-0 rounded-full p-2 ${tier.active ? "bg-primary/15" : "bg-secondary"}`}>
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                  <h3 className="font-bold text-foreground">{tier.label}</h3>
                  <span className="text-primary font-bold text-sm bg-primary/10 px-3 py-0.5 rounded-full">
                    +{tier.bonus}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong className="text-foreground">{tier.views} cumulative views</strong>
                </p>
                <p className="text-xs text-muted-foreground">{tier.note}</p>
                {tier.active && (
                  <p className="text-xs text-primary font-semibold mt-2">
                    🔥 You're closer than you think
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 bg-secondary/40 rounded-lg p-3.5 text-center">
        <p className="text-sm text-muted-foreground">
          All bonuses <strong className="text-foreground">stack on top</strong> of your per-clip earnings.
          Hit 1M total views → you've earned <strong className="text-primary">$1,111 + all per-clip pay</strong> along the way.
        </p>
      </div>
    </motion.section>
  );
};

export default BonusLadder;
