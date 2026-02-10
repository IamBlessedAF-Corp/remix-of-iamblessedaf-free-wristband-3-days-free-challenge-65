import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

const EXAMPLES = [
  { views: "1k–5k", perClip: "$2.22", weekly: "$22.20", monthly: "$88.80", highlight: false },
  { views: "10k", perClip: "$2.22", weekly: "$22.20", monthly: "$88.80", highlight: false },
  { views: "20k", perClip: "$4.40", weekly: "$44.00", monthly: "$176", highlight: true },
  { views: "50k", perClip: "$11.00", weekly: "$110.00", monthly: "$440", highlight: false },
];

const ClipperCalculator = () => (
  <motion.section
    className="px-4 py-8 max-w-3xl mx-auto"
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
  >
    <div className="bg-card border border-border rounded-xl p-5 md:p-7">
      <div className="flex items-center gap-2.5 mb-1">
        <DollarSign className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Your Weekly Earnings — No Math Required</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Based on <strong className="text-foreground">10 clips per week</strong>. $0.22/1k views, $2.22 floor, $22 cap per clip.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/50 text-foreground">
              <th className="text-left px-4 py-2.5 font-semibold">Avg Views</th>
              <th className="text-left px-4 py-2.5 font-semibold">Per Clip</th>
              <th className="text-left px-4 py-2.5 font-semibold">Weekly</th>
              <th className="text-left px-4 py-2.5 font-semibold">Monthly</th>
            </tr>
          </thead>
          <tbody>
            {EXAMPLES.map((row) => (
              <tr
                key={row.views}
                className={`border-t border-border/30 ${row.highlight ? "bg-primary/5" : ""}`}
              >
                <td className="px-4 py-2.5 font-medium text-foreground">{row.views}</td>
                <td className="px-4 py-2.5 text-primary font-bold">{row.perClip}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.weekly}/wk</td>
                <td className="px-4 py-2.5 font-bold text-foreground">{row.monthly}/mo</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 bg-secondary/40 rounded-lg p-3.5 text-center">
        <p className="text-sm text-foreground">
          At 1,000 views you still pocket <strong className="text-primary">$2.22 per clip</strong>.
          Post 10 clips/week → <strong className="text-primary">$88.80/month</strong> before bonuses.
        </p>
      </div>
    </div>
  </motion.section>
);

export default ClipperCalculator;
