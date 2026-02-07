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
      {/* Benefit-driven headline — above fold */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        <span className="text-3xl md:text-4xl">❤️</span> Can't Feel Grateful Today?{" "}
        <span className="text-primary">Feed 11 People</span> & Unlock Your Gratitude Identity —{" "}
        <span className="text-primary">Instant Joy</span> Starts Here!
      </h1>

      {/* Epiphany Bridge — story subheadline */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto shadow-soft">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
          You just nailed the 3-Day Challenge — that warm buzz from confirmations?{" "}
          <span className="font-bold text-foreground">
            Imagine amplifying it with a custom pack that makes gratitude your identity
          </span>
          ... and feeds 11 people instantly through Feeding America.
        </p>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left mt-3">
          Bad day? Flip it to{" "}
          <span className="font-bold text-foreground">"I made a difference."</span>{" "}
          Science says it's the fastest brain rewire — Huberman's studies show received thanks boosts happiness{" "}
          <span className="font-bold text-primary">27x!</span>
        </p>
      </div>
    </motion.div>
  );
};

export default GrokHeroSection;
