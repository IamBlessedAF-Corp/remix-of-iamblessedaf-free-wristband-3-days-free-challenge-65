import { motion } from "framer-motion";

const GrokHeroSection = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hook — data-driven, precision language */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        Your Brain Rewire Protocol:{" "}
        <span className="text-primary">540Hz Joy State</span> in 3 Minutes/Day — Backed by 8 Peer-Reviewed Studies
      </h1>

      {/* Clinical Data Bridge — systematic, ROI-focused */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto shadow-soft">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider font-mono">⚡ Protocol Activation Report</span>
        </div>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
          <span className="font-bold text-foreground">3-Day Challenge complete.</span>{" "}
          Your mPFC activation data shows elevated pro-social circuit engagement.{" "}
          <span className="font-bold text-foreground">
            Next step: lock in the neural pathway with a precision gratitude system
          </span>{" "}
          — calibrated to trigger 27× serotonin + dopamine response daily.
        </p>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left mt-3">
          ROI calculation: <span className="font-bold text-primary font-mono">$0.30/day</span> ={" "}
          <span className="font-bold text-primary font-mono">27× happiness multiplier</span> for 365 days.
          Huberman Protocol compliance: received gratitude activates mPFC → serotonin surge → sustained joy state.{" "}
          <span className="font-bold text-foreground">Plus 11 meals deployed via Feeding America — instant impact metric.</span>
        </p>
      </div>
    </motion.div>
  );
};

export default GrokHeroSection;
