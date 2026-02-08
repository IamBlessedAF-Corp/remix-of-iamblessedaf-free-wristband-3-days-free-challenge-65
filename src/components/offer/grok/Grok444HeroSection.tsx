import { motion } from "framer-motion";

const Grok444HeroSection = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Benefit-driven headline — ROI math */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        $444 ÷ 365 ={" "}
        <span className="text-primary">$1.22/day</span> to Feel{" "}
        <span className="text-primary">27× Happier</span> & Feed 1,111 People
      </h1>

      {/* Epiphany Bridge — math-heavy */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto shadow-soft">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
          One shirt is a statement.{" "}
          <span className="font-bold text-foreground">
            Five shirts = a daily identity. A lifestyle. A habit that sticks.
          </span>{" "}
          Research shows identity shifts require daily repetition — this pack covers every weekday.
        </p>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left mt-3">
          The full stack:{" "}
          <span className="font-bold text-foreground">5 black shirts + 3 custom friend shirts + 14 wristbands</span>{" "}
          + <span className="font-bold text-primary">1,111 meals donated</span> instantly.
          Total value: <span className="font-bold text-foreground line-through">$888</span>.{" "}
          You pay <span className="font-bold text-primary">$444</span> — 50% off.
        </p>
      </div>
    </motion.div>
  );
};

export default Grok444HeroSection;
