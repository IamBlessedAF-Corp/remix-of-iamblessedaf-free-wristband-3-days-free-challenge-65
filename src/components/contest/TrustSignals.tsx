import { motion } from "framer-motion";
import { DollarSign, Shield, Ban, CheckCircle, Clock, Eye } from "lucide-react";

const signals = [
  {
    icon: DollarSign,
    title: "$2.22 Floor Per Clip",
    desc: "Even at 1k views, you pocket $2.22. No promises — actual pay.",
  },
  {
    icon: Shield,
    title: "No Followers Needed",
    desc: "Zero gatekeeping. Valid clip + views = money. Period.",
  },
  {
    icon: Ban,
    title: "No Fees, No Catches",
    desc: "Free to join. No credit card. We pay you — not the other way.",
  },
  {
    icon: Eye,
    title: "Verified View Counts",
    desc: "We use your platform's public analytics. No inflated numbers.",
  },
  {
    icon: Clock,
    title: "Weekly Payouts",
    desc: "Processed every week. Dashboard shows every clip, view count & status.",
  },
  {
    icon: CheckCircle,
    title: "Program Is Live Now",
    desc: "Clippers are submitting and getting paid today. Not a waitlist.",
  },
];

const TrustSignals = () => (
  <motion.section
    className="px-4 py-10 max-w-3xl mx-auto"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
  >
    <h2 className="text-2xl font-bold mb-1">What's Guaranteed</h2>
    <p className="text-sm text-muted-foreground mb-6">
      No fine print. No approval committee. Here's what you get.
    </p>

    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {signals.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={i}
            className="bg-card rounded-xl p-4 border border-border/50"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Icon className="w-5 h-5 text-primary mb-2" />
            <h3 className="font-bold text-sm text-foreground mb-0.5">{s.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
          </motion.div>
        );
      })}
    </div>
  </motion.section>
);

export default TrustSignals;
