import { motion } from "framer-motion";
import { Trophy, Target, Star, Flame, Zap } from "lucide-react";

const tiers = [
  {
    icon: Flame,
    views: "25,000",
    bonus: "$22 + 2×",
    label: "First 25k Accelerator",
    note: "Hit 25k views in 4 days + post 5 clips → $22 instant bonus + 2× earnings for 48hrs.",
    active: true,
    special: true,
  },
  {
    icon: Target,
    views: "100,000",
    bonus: "$111",
    label: "First Payday",
    note: "10 clips/week at 10k avg → unlock in ~10 weeks.",
    active: false,
  },
  {
    icon: Star,
    views: "500,000",
    bonus: "$444",
    label: "Momentum Builder",
    note: "One clip breaking 50k+ accelerates this dramatically.",
    active: false,
  },
  {
    icon: Trophy,
    views: "1,000,000",
    bonus: "$1,111",
    label: "Super Payout",
    note: "Cumulative across ALL clips. Just keep stacking views.",
    active: false,
  },
];

const BonusLadder = () => (
  <motion.section
    className="px-4 py-10 max-w-3xl mx-auto"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
  >
    <h2 className="text-2xl font-bold mb-1">Bonus Ladder — Stack As You Grow</h2>
    <p className="text-sm text-muted-foreground mb-6">
      One-time bonuses on top of per-clip pay. Cumulative views — nothing resets.
    </p>

    <div className="space-y-3">
      {tiers.map((tier, i) => {
        const Icon = tier.icon;
        return (
          <motion.div
            key={tier.views}
            className={`flex items-start gap-3.5 rounded-xl border p-4 ${
              tier.special
                ? "border-primary/50 bg-primary/5"
                : tier.active
                ? "border-primary/30 bg-primary/5"
                : "border-border/50 bg-card"
            }`}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className={`shrink-0 rounded-full p-2 ${tier.special || tier.active ? "bg-primary/15" : "bg-secondary"}`}>
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                <h3 className="font-bold text-sm text-foreground">{tier.label}</h3>
                <span className="text-primary font-bold text-xs bg-primary/10 px-2.5 py-0.5 rounded-full">
                  +{tier.bonus}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">{tier.views} views</strong> · {tier.note}
              </p>
              {tier.special && (
                <p className="text-[10px] text-primary font-semibold mt-1">
                  ⚡ One-time new clipper bonus · 2× multiplier on clip RPM only
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>

    <div className="mt-5 bg-secondary/40 rounded-lg p-3 text-center">
      <p className="text-xs text-muted-foreground">
        All bonuses <strong className="text-foreground">stack on top</strong> of per-clip earnings.
        1M total views = <strong className="text-primary">$1,111 + all clip pay</strong> along the way.
      </p>
    </div>
  </motion.section>
);

export default BonusLadder;
