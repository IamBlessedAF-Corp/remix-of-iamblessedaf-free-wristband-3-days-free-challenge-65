import { motion } from "framer-motion";
import { Users, Heart, Star, TrendingUp } from "lucide-react";

const GrokSocialProof = () => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Data-driven header */}
      <p className="text-center text-lg font-bold text-foreground mb-3">
        Protocol Results — Verified Data Points
      </p>

      {/* Metrics first — data-driven */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center shadow-soft">
          <Users className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground font-mono">2,340</p>
          <p className="text-[10px] text-muted-foreground">active users</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center shadow-soft">
          <Heart className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground font-mono">25k+</p>
          <p className="text-[10px] text-muted-foreground">meals deployed</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center shadow-soft">
          <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground font-mono">94%</p>
          <p className="text-[10px] text-muted-foreground">report uplift</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center shadow-soft">
          <Star className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground font-mono">27×</p>
          <p className="text-[10px] text-muted-foreground">avg. multiplier</p>
        </div>
      </div>

      {/* Testimonials — results-focused */}
      <div className="space-y-3 mb-4">
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Sarah M.</p>
              <p className="text-[10px] text-muted-foreground font-mono">Day 47 · 1,200 BCs · Verified</p>
            </div>
          </div>
          <p className="text-sm italic text-foreground leading-relaxed">
            "The rewire kicked in around day 12.{" "}
            <span className="font-bold text-primary">Bad days now last 20 minutes instead of 20 hours.</span>{" "}
            The meal impact metric alone makes it worth it — that's measurable joy."
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Marcus T.</p>
              <p className="text-[10px] text-muted-foreground font-mono">Day 89 · 890 BCs · Verified</p>
            </div>
          </div>
          <p className="text-sm italic text-foreground leading-relaxed">
            "Shirt triggers ~3 gratitude conversations/week. Each one = a neural pathway reinforcement.{" "}
            <span className="font-bold text-primary">Compound effect is real — I track it.</span>"
          </p>
        </div>
      </div>

      <p className="text-center text-sm font-semibold text-primary font-mono">
        Protocol activation: your data point starts now →
      </p>
    </motion.div>
  );
};

export default GrokSocialProof;
