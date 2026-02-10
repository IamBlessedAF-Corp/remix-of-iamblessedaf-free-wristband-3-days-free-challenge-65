import { motion } from "framer-motion";
import { Shield, DollarSign, Ban, CheckCircle } from "lucide-react";

const guarantees = [
  {
    icon: DollarSign,
    title: "$2.22 Minimum Per Clip",
    desc: "Your clip gets 1,000 views? You pocket $2.22. Not promises — actual pay. Views verified via platform analytics.",
  },
  {
    icon: Shield,
    title: "No Follower Requirements",
    desc: "No minimum followers. No approval committee. No gatekeeping. Valid clip + views = money.",
  },
  {
    icon: Ban,
    title: "No Hidden Fees or Catches",
    desc: "Free to join. No credit card to start. No monthly fees. You get paid — we don't charge you.",
  },
  {
    icon: CheckCircle,
    title: "Verified View Counts",
    desc: "We use your platform's public analytics. No inflated numbers, no made-up metrics. What you see is what counts.",
  },
];

const ContestGuarantees = () => (
  <section className="px-4 py-10 max-w-3xl mx-auto">
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <h2 className="text-2xl font-bold mb-1">What's Guaranteed</h2>
      <p className="text-sm text-muted-foreground mb-6">
        No fine print. Here's exactly what you get for every valid clip.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {guarantees.map((g, i) => {
          const Icon = g.icon;
          return (
            <motion.div
              key={i}
              className="bg-card rounded-xl p-5 border border-border/50"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Icon className="w-6 h-6 text-primary mb-2.5" />
              <h3 className="font-bold text-foreground mb-1">{g.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  </section>
);

export default ContestGuarantees;
