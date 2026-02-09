import { useState } from "react";
import { Calculator, DollarSign, Eye, Film } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const BC_CONVERSION_RATE = 0.02; // 2% of views convert to valid BCs

const ClipperCalculator = () => {
  const [avgViews, setAvgViews] = useState<string>("");
  const [clipsPerWeek, setClipsPerWeek] = useState<string>("");

  const views = parseInt(avgViews) || 0;
  const clips = parseInt(clipsPerWeek) || 0;
  const weeklyViews = views * clips;
  const estimatedBCs = Math.floor(weeklyViews * BC_CONVERSION_RATE);
  const weeklyEarnings = estimatedBCs * 2;
  const hasInput = views > 0 && clips > 0;

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
          <h2 className="text-2xl font-bold">💰 Earnings Calculator</h2>
          <p className="text-muted-foreground text-sm">See how much you can make clipping for IamBlessedAF</p>
        </div>
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
            placeholder="e.g. 5000"
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
            placeholder="e.g. 3"
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
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Weekly Views</p>
                <p className="text-2xl font-bold text-foreground">{weeklyViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{clips} clips × {views.toLocaleString()} views</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center border border-border/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Est. Valid Entries (BCs)</p>
                <p className="text-2xl font-bold text-primary">{estimatedBCs.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">~2% of views convert</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/30">
                <p className="text-xs text-primary uppercase tracking-wide mb-1 font-semibold">Weekly Earnings</p>
                <div className="flex items-center justify-center gap-1">
                  <DollarSign className="w-6 h-6 text-primary" />
                  <p className="text-3xl font-bold text-primary">{weeklyEarnings.toLocaleString()}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">@ $2 per valid entry</p>
              </div>
            </div>

            {weeklyEarnings >= 100 && (
              <motion.p
                className="text-center text-sm text-primary font-semibold mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                🔥 That's ${(weeklyEarnings * 4).toLocaleString()}/month just from clipping!
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClipperCalculator;
