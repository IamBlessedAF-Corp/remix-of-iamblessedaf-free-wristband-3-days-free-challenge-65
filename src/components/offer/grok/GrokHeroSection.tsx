import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const GrokHeroSection = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Benefit-driven headline — ROI-first */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        Invest $111 → Get{" "}
        <span className="text-primary">27× Happier</span>, Feed 11 People &{" "}
        <span className="text-primary">Rewire Your Brain</span> for Life
      </h1>

      {/* Epiphany Bridge — math-heavy */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto shadow-soft">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
          You proved it works in 3 days. Now the math:{" "}
          <span className="font-bold text-foreground">
            $111 = 1 identity shirt + 1 custom friend shirt + 3 wristbands + 11 meals donated
          </span>
          . That's <span className="font-bold text-primary">$0.30/day</span> to feel joy on demand for a year.
        </p>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left mt-3">
          Worst day ever? Look down at your shirt:{" "}
          <span className="font-bold text-foreground">"I already fed 11 people today."</span>{" "}
          Huberman's research: received gratitude boosts serotonin + dopamine{" "}
          <span className="font-bold text-primary">27×</span>. This pack triggers that loop daily.
        </p>
      </div>
    </motion.div>
  );
};

export default GrokHeroSection;
