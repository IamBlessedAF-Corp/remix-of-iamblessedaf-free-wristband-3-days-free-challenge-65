import { motion } from "framer-motion";
import { Megaphone, Lock, Zap, Rocket } from "lucide-react";

const phases = [
  {
    icon: Megaphone,
    phase: "Awareness",
    trigger: '"Get paid $2.22+ per clip"',
    trust: "Brand authority + transparent math",
    how: "You're here. You see the numbers. They check out.",
  },
  {
    icon: Lock,
    phase: "Activation",
    trigger: "Access Content Vault + clear rules",
    trust: "Standardized requirements + brief",
    how: "Sign up → get your link → pick clips from the vault → remix.",
  },
  {
    icon: Zap,
    phase: "First Payout",
    trigger: "Your first clip gets approved",
    trust: "Transparent dashboard + fast payment",
    how: "$2.22 hits your account. Trust manufactured.",
  },
  {
    icon: Rocket,
    phase: "Scale",
    trigger: "Bonuses + new campaign drops",
    trust: "Community + payout velocity",
    how: "More clips → more pay → you tell friends → loop compounds.",
  },
];

const ContestTrustPhases = () => (
  <section className="px-4 py-12 max-w-4xl mx-auto">
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl font-bold mb-2">🏗️ How We Build Trust (No BS)</h2>
      <p className="text-muted-foreground mb-8">
        The top 1% of clipper programs (Vyro, GoPro, HighLevel) share one pattern: 
        they <strong className="text-foreground">manufacture trust at every step</strong>. Here's our playbook — open-sourced for you.
      </p>

      <div className="space-y-4">
        {phases.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={i}
              className="bg-card rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-all"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs bg-primary/15 text-primary font-bold px-2.5 py-0.5 rounded-full">
                      Phase {i + 1}
                    </span>
                    <h3 className="text-lg font-bold">{p.phase}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong className="text-foreground">Trigger:</strong> {p.trigger}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">What happens:</strong> {p.how}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 bg-primary/10 border border-primary/20 rounded-xl p-5">
        <p className="text-foreground font-semibold mb-1">🔑 The Insight from Top 1% Programs</p>
        <p className="text-muted-foreground text-sm">
          "The audience is the best paid media team… if you pay them for performance."
          The old belief: clipping = hobby. The new belief: <strong className="text-foreground">clipping is a measurable acquisition channel</strong> — 
          CPV/CPM without traditional ad spend. We're building that for gratitude.
        </p>
      </div>
    </motion.div>
  </section>
);

export default ContestTrustPhases;
