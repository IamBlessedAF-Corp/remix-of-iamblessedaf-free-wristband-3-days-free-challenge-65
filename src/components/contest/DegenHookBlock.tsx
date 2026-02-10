import { motion } from "framer-motion";
import { Zap, Shield } from "lucide-react";

const DegenHookBlock = () => (
  <motion.section
    className="px-4 pt-8 pb-2 max-w-3xl mx-auto"
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
  >
    <div className="relative overflow-hidden bg-card border border-primary/30 rounded-xl p-5 md:p-7">
      {/* Accent glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Headline */}
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            High-Output Path
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-foreground leading-tight">
          One hard week can unlock <span className="text-primary">$1,111</span>.
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Bonuses are cumulative and stack on top of every clip you get paid for.
          The math rewards volume.
        </p>

        {/* Degen Path example */}
        <div className="mt-5 bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
            7-Day Degen Run Example
          </p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Post 5 clips/day × 7 days</span>
              <span className="font-bold text-foreground">35 clips</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg 10k views each</span>
              <span className="font-bold text-foreground">350,000 views</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clip earnings (35 × $2.22)</span>
              <span className="font-bold text-primary">$77.70</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">+ 100k bonus unlocked</span>
              <span className="font-bold text-primary">+ $111</span>
            </div>
            <div className="border-t border-primary/20 pt-1.5 flex justify-between">
              <span className="font-bold text-foreground">Total in 7 days</span>
              <span className="font-black text-primary text-lg">$188.70</span>
            </div>
          </div>
        </div>

        {/* Safety line */}
        <div className="mt-4 flex items-start gap-2">
          <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Even if no clip goes viral, you still earn <strong className="text-foreground">$2.22 per clip guaranteed</strong>.
            Every view counts. Bonuses never expire.
          </p>
        </div>

        {/* Next Milestones teaser */}
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span>Next milestones:</span>
          <span className="font-semibold text-foreground">$444 <span className="font-normal text-muted-foreground">at 500k views</span></span>
          <span className="text-border">|</span>
          <span className="font-semibold text-foreground">$1,111 <span className="font-normal text-muted-foreground">at 1M views</span></span>
        </div>

        {/* Disclaimer */}
        <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground/60">
          This example illustrates potential earnings at specific view volumes. Actual results depend on content performance.
          Lower-view clips still earn the $2.22 minimum. Bonuses are cumulative and volume-based — not guaranteed.
        </p>
      </div>
    </div>
  </motion.section>
);

export default DegenHookBlock;
