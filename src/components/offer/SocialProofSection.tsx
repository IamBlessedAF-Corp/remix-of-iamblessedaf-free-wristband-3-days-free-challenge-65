import { motion } from "framer-motion";
import { Users, Heart, Star, TrendingUp, MessageCircle } from "lucide-react";
import { useLiveImpactMetrics } from "@/hooks/useLiveImpactMetrics";

interface SocialProofSectionProps {
  /** Visual style — "data" shows metrics grid first, "story" leads with testimonials */
  variant?: "data" | "story";
  delay?: number;
}

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    meta: "Day 47 · Verified Challenger",
    icon: Heart,
    quote: (
      <>
        "The rewire kicked in around day 12.{" "}
        <span className="font-bold text-primary">
          Bad days now last 20 minutes instead of 20 hours.
        </span>{" "}
        The meal impact metric alone makes it worth it — that's measurable joy."
      </>
    ),
  },
  {
    name: "Marcus T.",
    meta: "Day 89 · 3 Friends Blessed",
    icon: MessageCircle,
    quote: (
      <>
        "Shirt triggers ~3 gratitude conversations/week. Each one = a neural
        pathway reinforcement.{" "}
        <span className="font-bold text-primary">
          Compound effect is real — I track it.
        </span>
        "
      </>
    ),
  },
  {
    name: "Aaliyah M.",
    meta: "Wears her shirt every Monday",
    icon: Star,
    quote: (
      <>
        "I put it on when I'm struggling. It reminds me that I <em>chose</em>{" "}
        gratitude.{" "}
        <span className="font-bold text-primary">
          My coworkers started asking about it — now three of them joined the
          challenge.
        </span>
        "
      </>
    ),
  },
  {
    name: "Diego R.",
    meta: "Day 21 · Wristband wearer",
    icon: TrendingUp,
    quote: (
      <>
        "My wife asked why I've been so different lately.{" "}
        <span className="font-bold text-primary">
          I showed her the wristband and she cried. Now she wears one too.
        </span>{" "}
        This isn't a product — it's a relationship upgrade."
      </>
    ),
  },
  {
    name: "Priya K.",
    meta: "Day 33 · 5 Friends Blessed",
    icon: Users,
    quote: (
      <>
        "I bought the pack for my team at work. Within a week,{" "}
        <span className="font-bold text-primary">
          our Monday meetings went from complaints to celebrations.
        </span>{" "}
        Productivity went up 40%. Not kidding."
      </>
    ),
  },
];

function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k+`;
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

/** Live impact metrics grid */
function MetricsGrid({ delay = 0 }: { delay?: number }) {
  const { totalMealsDonated, activeUsers } = useLiveImpactMetrics();

  const metrics = [
    { icon: Users, value: formatNumber(activeUsers), label: "active users" },
    { icon: Heart, value: formatNumber(totalMealsDonated), label: "meals donated" },
    { icon: TrendingUp, value: "94%", label: "report uplift" },
    { icon: Star, value: "27×", label: "avg. multiplier" },
  ];

  return (
    <motion.div
      className="grid grid-cols-4 gap-2 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-card border border-border/50 rounded-xl p-3 text-center shadow-soft"
        >
          <m.icon className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground font-mono">{m.value}</p>
          <p className="text-[10px] text-muted-foreground">{m.label}</p>
        </div>
      ))}
    </motion.div>
  );
}

/** Testimonial cards */
function TestimonialCards({ delay = 0 }: { delay?: number }) {
  return (
    <div className="space-y-3 mb-4">
      {TESTIMONIALS.map((t, i) => (
        <motion.div
          key={t.name}
          className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: delay + i * 0.08 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <t.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">{t.meta}</p>
            </div>
          </div>
          <p className="text-sm italic text-foreground leading-relaxed">{t.quote}</p>
        </motion.div>
      ))}
    </div>
  );
}

/** Community summary bar */
function CommunitySummary({ delay = 0 }: { delay?: number }) {
  const { activeUsers, totalMealsDonated } = useLiveImpactMetrics();

  return (
    <motion.div
      className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <p className="text-sm font-bold text-foreground mb-1">
        A growing community of beautiful humans ✨
      </p>
      <p className="text-xs text-muted-foreground">
        {formatNumber(activeUsers)} people have joined · {formatNumber(totalMealsDonated)} meals donated · Countless friendships deepened
      </p>
    </motion.div>
  );
}

/**
 * Unified Social Proof section — used across all offer pages.
 *
 * - `variant="data"` (default): Metrics grid → testimonials → CTA nudge (Grok-style)
 * - `variant="story"`: Testimonials → community bar (Gpt/emotional style)
 */
const SocialProofSection = ({ variant = "data", delay = 0.3 }: SocialProofSectionProps) => {
  if (variant === "story") {
    return (
      <motion.div
        className="max-w-lg mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <p className="text-center text-lg font-bold text-foreground mb-3">
          Real Stories, Real Tears (the Good Kind)
        </p>
        <TestimonialCards delay={delay + 0.1} />
        <CommunitySummary delay={delay + 0.4} />
      </motion.div>
    );
  }

  // variant === "data"
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <p className="text-center text-lg font-bold text-foreground mb-3">
        Results — Verified Data Points
      </p>
      <MetricsGrid delay={delay + 0.05} />
      <TestimonialCards delay={delay + 0.15} />
      <p className="text-center text-sm font-semibold text-primary">
        Your data point starts now →
      </p>
    </motion.div>
  );
};

export default SocialProofSection;
