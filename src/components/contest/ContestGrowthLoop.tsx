import { motion } from "framer-motion";
import { ArrowRight, Repeat, Zap, TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react";

const loopSteps = [
  { icon: Zap, label: "Content Vault", sub: "Curated clips ready to remix" },
  { icon: Users, label: "Clippers Produce Shorts", sub: "Your remix, your style" },
  { icon: TrendingUp, label: "Organic Distribution", sub: "TikTok · IG · YouTube Shorts" },
  { icon: BarChart3, label: "Views Verified", sub: "Platform analytics tracked" },
  { icon: DollarSign, label: "Payout", sub: "$2.22 floor → instant" },
  { icon: Repeat, label: "More Clippers Join", sub: "Loop accelerates" },
];

const ContestGrowthLoop = () => (
  <section className="px-4 py-12 bg-secondary/20">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold mb-2 text-center">🔄 This Is a Loop, Not a Funnel</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          Most clipper programs are linear. Ours compounds. Every clip you post creates more reach, 
          more budget, and more campaigns — which means <strong className="text-foreground">more money for you</strong>.
        </p>

        {/* Loop visualization */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {loopSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                className="relative bg-card rounded-xl p-4 border border-border/50 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-bold text-sm">{step.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.sub}</p>
                {i < loopSteps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Competitive positioning */}
        <div className="bg-card rounded-xl border border-border/50 p-6">
          <p className="font-bold text-lg mb-3">📊 How We Compare to Top 1% Programs</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/60">
                  <th className="text-left px-3 py-2 font-semibold">Feature</th>
                  <th className="text-left px-3 py-2 font-semibold text-primary">IamBlessedAF</th>
                  <th className="text-left px-3 py-2 font-semibold">Vyro</th>
                  <th className="text-left px-3 py-2 font-semibold">HighLevel</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-t border-border/30">
                  <td className="px-3 py-2">Floor Pay</td>
                  <td className="px-3 py-2 text-primary font-bold">$2.22</td>
                  <td className="px-3 py-2">Varies</td>
                  <td className="px-3 py-2">$0</td>
                </tr>
                <tr className="border-t border-border/30">
                  <td className="px-3 py-2">RPM</td>
                  <td className="px-3 py-2 text-primary font-bold">$0.22/1k</td>
                  <td className="px-3 py-2">Campaign-based</td>
                  <td className="px-3 py-2">$0.10–$0.15</td>
                </tr>
                <tr className="border-t border-border/30">
                  <td className="px-3 py-2">Content Vault</td>
                  <td className="px-3 py-2 text-primary font-bold">✓ 24+ clips</td>
                  <td className="px-3 py-2">✓</td>
                  <td className="px-3 py-2">✓</td>
                </tr>
                <tr className="border-t border-border/30">
                  <td className="px-3 py-2">Social Impact</td>
                  <td className="px-3 py-2 text-primary font-bold">1 meal/claim</td>
                  <td className="px-3 py-2">—</td>
                  <td className="px-3 py-2">—</td>
                </tr>
                <tr className="border-t border-border/30">
                  <td className="px-3 py-2">Bonus Prize</td>
                  <td className="px-3 py-2 text-primary font-bold">$1,111/week</td>
                  <td className="px-3 py-2">—</td>
                  <td className="px-3 py-2">Affiliate %</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default ContestGrowthLoop;
