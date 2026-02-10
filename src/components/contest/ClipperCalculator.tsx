import { useState } from "react";
import { Calculator, DollarSign, Eye, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const calcEarnings = (views: number) => {
  // $0.22 per 1,000 views, $2.22 floor, $22 cap
  const raw = (views / 1000) * 0.22;
  return Math.min(22, Math.max(2.22, raw));
};

const ClipperCalculator = () => {
  const [avgViews, setAvgViews] = useState<string>("15000");
  const [clipsPerWeek, setClipsPerWeek] = useState<string>("10");

  const views = parseInt(avgViews) || 0;
  const clips = parseInt(clipsPerWeek) || 0;
  const perClip = views > 0 ? calcEarnings(views) : 0;
  const weeklyEarnings = parseFloat((perClip * clips).toFixed(2));
  const monthlyEarnings = parseFloat((weeklyEarnings * 4).toFixed(2));
  const hasInput = views > 0 && clips > 0;

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
          <h2 className="text-2xl font-bold">💰 Your Earnings Math</h2>
          <p className="text-muted-foreground text-sm">$2.22 guaranteed per clip — even at just 1,000 views</p>
        </div>
      </div>

      {/* Earnings table */}
      <div className="overflow-x-auto mb-6 rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/60 text-foreground">
              <th className="text-left px-4 py-2.5 font-semibold">Views</th>
              <th className="text-left px-4 py-2.5 font-semibold">You Get</th>
              <th className="text-left px-4 py-2.5 font-semibold">10 clips/wk</th>
              <th className="text-left px-4 py-2.5 font-semibold">Monthly</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {[
              { v: 1000, label: "1k" },
              { v: 5000, label: "5k" },
              { v: 10000, label: "10k" },
              { v: 20000, label: "20k" },
              { v: 50000, label: "50k" },
            ].map((row) => {
              const paid = calcEarnings(row.v);
              const weekly = paid * 10;
              const monthly = weekly * 4;
              return (
                <tr key={row.v} className="border-t border-border/30">
                  <td className="px-4 py-2 font-medium text-foreground">{row.label}</td>
                  <td className="px-4 py-2 font-bold text-primary">${paid.toFixed(2)}</td>
                  <td className="px-4 py-2">${weekly.toFixed(2)}/wk</td>
                  <td className="px-4 py-2 font-bold text-foreground">${monthly.toFixed(0)}/mo</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 text-center">
        <p className="text-foreground font-semibold">
          ☝️ Even at 1,000 views you pocket <span className="text-primary">$2.22</span>. 
          Post 10 clips/week at 5k avg = <span className="text-primary font-bold">$88.80/month</span> from content you'd make anyway.
        </p>
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
            placeholder="e.g. 15000"
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
            placeholder="e.g. 10"
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClipperCalculator;
