import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Zap, Shield } from "lucide-react";

const STABLE_ROWS = [
  { views: "1k–5k", perClip: "$2.22", weekly: "$22.20", monthly: "$88.80", highlight: false },
  { views: "10k", perClip: "$2.22", weekly: "$22.20", monthly: "$88.80", highlight: false },
  { views: "20k", perClip: "$4.40", weekly: "$44.00", monthly: "$176", highlight: true },
  { views: "50k", perClip: "$11.00", weekly: "$110.00", monthly: "$440", highlight: false },
];

const DEGEN_ROWS = [
  { scenario: "3 clips/day × 7d", clips: 21, avgViews: "5k", weekEarn: "$46.62", bonusHit: "—" },
  { scenario: "5 clips/day × 7d", clips: 35, avgViews: "10k", weekEarn: "$77.70", bonusHit: "$111 (100k)", highlight: true },
  { scenario: "5 clips/day × 14d", clips: 70, avgViews: "10k", weekEarn: "$155.40", bonusHit: "$444 (500k)" },
  { scenario: "7 clips/day × 21d", clips: 147, avgViews: "10k", weekEarn: "$326.34", bonusHit: "$1,111 (1M)" },
];

type Mode = "stable" | "degen";

const ClipperCalculator = () => {
  const [mode, setMode] = useState<Mode>("stable");

  return (
    <motion.section
      className="px-4 py-8 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-card border border-border rounded-xl p-5 md:p-7">
        {/* Header + Toggle */}
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">
              {mode === "stable" ? "Your Weekly Earnings" : "Degen Earnings Scenarios"}
            </h2>
          </div>

          {/* Toggle */}
          <div className="flex items-center bg-secondary/60 rounded-lg p-0.5">
            <button
              onClick={() => setMode("stable")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                mode === "stable"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Stable
            </button>
            <button
              onClick={() => setMode("degen")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                mode === "degen"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Degen
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground mb-5">
          {mode === "stable"
            ? <>Based on <strong className="text-foreground">10 clips per week</strong>. $0.22/1k views, $2.22 floor, $22 cap per clip.</>
            : <>Same math, higher volume. See what happens when you go hard for a sprint.</>}
        </p>

        {/* Stable Table */}
        {mode === "stable" && (
          <motion.div
            key="stable"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
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
                  {STABLE_ROWS.map((row) => (
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
          </motion.div>
        )}

        {/* Degen Table */}
        {mode === "degen" && (
          <motion.div
            key="degen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="overflow-x-auto rounded-lg border border-primary/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary/5 text-foreground">
                    <th className="text-left px-3 py-2.5 font-semibold">Sprint</th>
                    <th className="text-left px-3 py-2.5 font-semibold">Clips</th>
                    <th className="text-left px-3 py-2.5 font-semibold">Earned</th>
                    <th className="text-left px-3 py-2.5 font-semibold">Bonus Unlock</th>
                  </tr>
                </thead>
                <tbody>
                  {DEGEN_ROWS.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-t border-primary/10 ${row.highlight ? "bg-primary/5" : ""}`}
                    >
                      <td className="px-3 py-2.5 text-foreground text-xs font-medium">{row.scenario}</td>
                      <td className="px-3 py-2.5 font-bold text-foreground">{row.clips}</td>
                      <td className="px-3 py-2.5 text-primary font-bold">{row.weekEarn}</td>
                      <td className="px-3 py-2.5 text-xs font-semibold text-foreground">{row.bonusHit || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-3.5 text-center">
              <p className="text-sm text-foreground">
                Bonuses <strong className="text-primary">stack on top</strong> of clip earnings.
                A 35-clip sprint at 10k avg = <strong className="text-primary">$188.70 in one week</strong>.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default ClipperCalculator;
