import { motion } from "framer-motion";
import { Shield, Eye, DollarSign, Zap, Clock } from "lucide-react";

const ContestGuarantees = () => (
  <section className="px-4 py-12 max-w-4xl mx-auto">
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl font-bold mb-3">🛡️ Zero-Risk Guarantees</h2>
      <p className="text-muted-foreground mb-8">
        The system that kills clipper programs: broken verification + slow payouts. Here's why ours won't break.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          {
            icon: DollarSign,
            title: "Paid On Views. Period.",
            desc: "Not promises, not 'potential.' Platform analytics verified. $2.22 floor at 1,000 views — no minimum threshold BS.",
          },
          {
            icon: Clock,
            title: "Payout Velocity",
            desc: "Fast payouts = retention. The top 1% (Vyro, HighLevel) know this. We process weekly — not monthly, not 'when we feel like it.'",
          },
          {
            icon: Shield,
            title: "No Fluff, No Catches",
            desc: "No minimum follower count. No approval committee. Valid clip + views = money. Standardized rules, not subjective vibes.",
          },
          {
            icon: Eye,
            title: "Full Transparency Dashboard",
            desc: "See your clips, views, earnings, and payout status in real time. The same infra the top programs use — tracking + verification + anti-fraud.",
          },
        ].map((g, i) => {
          const Icon = g.icon;
          return (
            <motion.div
              key={i}
              className="bg-card rounded-xl p-6 border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-bold mb-2">{g.title}</h3>
              <p className="text-muted-foreground text-sm">{g.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 bg-secondary/40 rounded-xl p-5 border border-border/50">
        <p className="text-foreground font-semibold mb-1">⚠️ What Would Kill This System</p>
        <p className="text-muted-foreground text-sm">
          Fraud and slow payments. That's what kills every clipper program. Our stack: 
          <strong className="text-foreground"> content vault → submission + compliance → view tracking → fast payout → campaign ops</strong>. 
          The same backend blueprint used by Vyro and HighLevel. Built for scale, not for show.
        </p>
      </div>
    </motion.div>
  </section>
);

export default ContestGuarantees;
