import { useState } from "react";
import { Calculator, DollarSign, Eye, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const calcEarnings = (views: number) => {
  // $0.22 per 1,000 views, $2 floor, $22 cap
  const raw = (views / 1000) * 0.22;
  return Math.min(22, Math.max(2, raw));
};

const ClipperCalculator = () => {
  const [avgViews, setAvgViews] = useState<string>("");
  const [clipsPerWeek, setClipsPerWeek] = useState<string>("");

  const views = parseInt(avgViews) || 0;
  const clips = parseInt(clipsPerWeek) || 0;
  const perClip = views > 0 ? calcEarnings(views) : 0;
  const weeklyEarnings = parseFloat((perClip * clips).toFixed(2));
  const monthlyEarnings = parseFloat((weeklyEarnings * 4).toFixed(2));
  const hasInput = views > 0 && clips > 0;

  // RPM = earnings per 1k views
  const effectiveRpm = views > 0 ? parseFloat(((perClip / views) * 1000).toFixed(2)) : 0;

  return (
    <motion.div
      className="bg-card border border-primary/30 rounded-2xl p-6 md:p-8 mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/15 p-2.5 rounded-xl">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">💰 Exact Earnings Math</h2>
          <p className="text-muted-foreground text-sm">$2 floor + $0.22/1k views + $22 cap — plug your numbers</p>
        </div>
      </div>

      {/* Earnings table */}
      <div className="overflow-x-auto mb-6 rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/60 text-foreground">
              <th className="text-left px-4 py-2.5 font-semibold">Views</th>
              <th className="text-left px-4 py-2.5 font-semibold">Raw Calc</th>
              <th className="text-left px-4 py-2.5 font-semibold">You Get</th>
              <th className="text-left px-4 py-2.5 font-semibold">Eff. RPM</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {[
              { v: 5000, label: "5k" },
              { v: 9091, label: "~9k" },
              { v: 20000, label: "20k" },
              { v: 50000, label: "50k" },
              { v: 100000, label: "100k" },
            ].map((row) => {
              const raw = (row.v / 1000) * 0.22;
              const paid = calcEarnings(row.v);
              const rpm = ((paid / row.v) * 1000).toFixed(2);
              return (
                <tr key={row.v} className="border-t border-border/30">
                  <td className="px-4 py-2 font-medium text-foreground">{row.label}</td>
                  <td className="px-4 py-2">${raw.toFixed(2)}</td>
                  <td className="px-4 py-2 font-bold text-primary">${paid.toFixed(2)}</td>
                  <td className="px-4 py-2">${rpm}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <div className="space-y-2">
          <Label htmlFor="avg-views" className="flex items-center gap-2 text-foreground">
            <Eye className="w-4 h-4 text-primary" />
            Average views per clip
          </Label>
          <Input
            id="avg-views"
            type="number"
            min="0"
            placeholder="e.g. 20000"
            value={avgViews}
            onChange={(e) => setAvgViews(e.target.value)}
            className="h-12 text-lg bg-background border-border/60 focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clips-week" className="flex items-center gap-2 text-foreground">
            <Film className="w-4 h-4 text-primary" />
            Clips you post per week
          </Label>
          <Input
            id="clips-week"
            type="number"
            min="0"
            placeholder="e.g. 5"
            value={clipsPerWeek}
            onChange={(e) => setClipsPerWeek(e.target.value)}
            className="h-12 text-lg bg-background border-border/60 focus:border-primary"
          />
        </div>
      </div>

      <AnimatePresence>
        {hasInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-secondary/50 rounded-xl p-4 text-center border border-border/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Per Clip</p>
                <p className="text-2xl font-bold text-foreground">${perClip.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{effectiveRpm > 0 ? `$${effectiveRpm} RPM` : ""}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center border border-border/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Weekly</p>
                <p className="text-2xl font-bold text-primary">${weeklyEarnings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{clips} clips × ${perClip.toFixed(2)}</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/30">
                <p className="text-xs text-primary uppercase tracking-wide mb-1 font-semibold">Monthly</p>
                <div className="flex items-center justify-center gap-1">
                  <DollarSign className="w-6 h-6 text-primary" />
                  <p className="text-3xl font-bold text-primary">{monthlyEarnings.toLocaleString()}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">4 weeks × ${weeklyEarnings}</p>
              </div>
            </div>

            {monthlyEarnings >= 50 && (
              <motion.p
                className="text-center text-sm text-primary font-semibold mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                🔥 That's {((perClip / 0.003) / 100).toFixed(0)}x better than standard TikTok Creator Fund RPM
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClipperCalculator;
