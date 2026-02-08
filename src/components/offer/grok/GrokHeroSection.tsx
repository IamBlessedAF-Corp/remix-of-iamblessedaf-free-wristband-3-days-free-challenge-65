import { motion } from "framer-motion";

const GrokHeroSection = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hook — benefit-driven, 3-second grab */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        Can't Feel Grateful Today? Feed 11 People &{" "}
        <span className="text-primary">Unlock Your Gratitude Identity</span> — Instant Joy Starts Here!
      </h1>

      {/* Epiphany Bridge — conversational story → "aha!" */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto shadow-soft">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
          You just nailed the 3-Day Challenge — that warm buzz from confirmations?{" "}
          <span className="font-bold text-foreground">
            Imagine amplifying it with a custom pack that makes gratitude your identity...
            and feeds 11 people instantly through Feeding America.
          </span>
        </p>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left mt-3">
          Bad day? Flip it to{" "}
          <span className="font-bold text-foreground">"I made a difference."</span>{" "}
          Science says it's the fastest brain rewire — Huberman's studies show received thanks boosts happiness{" "}
          <span className="font-bold text-primary">27×</span>. That's{" "}
          <span className="font-bold text-primary">$0.30/day</span> to feel joy on demand for a full year.
        </p>
      </div>
    </motion.div>
  );
};

export default GrokHeroSection;
