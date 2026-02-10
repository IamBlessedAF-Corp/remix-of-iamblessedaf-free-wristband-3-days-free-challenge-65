import { motion } from "framer-motion";
import { Trophy, Target, Star } from "lucide-react";

const tiers = [
  {
    icon: Target,
    views: "100,000",
    bonus: "$111",
    label: "Your First Payday",
    note: "Post 10 clips/week at 10k avg → you unlock this in just 10 weeks. Most clippers get here before month 3.",
    color: "text-primary",
    active: true,
  },
  {
    icon: Star,
    views: "500,000",
    bonus: "$444",
    label: "Momentum Builder",
    note: "Keep posting consistently — one clip breaking 50k+ can accelerate this dramatically.",
    color: "text-primary",
    active: false,
  },
  {
    icon: Trophy,
    views: "1,000,000",
    bonus: "$1,111",
    label: "Super Payout",
    note: "Cumulative across ALL clips. No single video needs to go viral — just keep stacking views.",
    color: "text-primary",
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
      One-time bonuses on top of your per-clip earnings. Cumulative lifetime views — nothing resets.
    </p>

    <div className="relative space-y-4">
      {/* Vertical line */}
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
              <Icon className={`w-5 h-5 ${tier.color}`} />
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

export default BonusLadder;
