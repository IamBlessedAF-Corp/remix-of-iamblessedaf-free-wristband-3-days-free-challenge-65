import { motion } from "framer-motion";
import { Shield, Eye, DollarSign } from "lucide-react";

const ContestGuarantees = () => (
  <section className="px-4 py-12 max-w-4xl mx-auto">
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl font-bold mb-8">🛡️ Zero-Risk Guarantees</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            icon: DollarSign,
            title: "Paid On Views",
            desc: "Not promises, not 'potential.' Your clip gets views → you get paid. We verify via platform analytics.",
          },
          {
            icon: Shield,
            title: "No Fluff, No Catches",
            desc: "No minimum follower count. No approval committee. Valid clip + views = money. That's the whole deal.",
          },
          {
            icon: Eye,
            title: "Full Transparency",
            desc: "Creator dashboard shows your clips, views, earnings in real time. You see exactly what you're owed.",
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
    </motion.div>
  </section>
);

export default ContestGuarantees;
