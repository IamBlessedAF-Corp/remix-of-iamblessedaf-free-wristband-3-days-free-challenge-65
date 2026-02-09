import { motion } from "framer-motion";

const GrokHeroSection = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hook — Version A: punchy ROI math (Hormozi + Neville style) */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        $111 ÷ 365 ={" "}
        <span className="text-primary">$0.30/Day</span> to Feel{" "}
        <span className="text-primary">27× Happier</span> Than You Do Right Now
      </h1>

      {/* Epiphany Bridge — simple math, clear ROI */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto shadow-soft">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
          <span className="font-bold text-foreground">Here's the math:</span>{" "}
          Harvard tracked 724 people for 85 years. The happiest ones weren't rich or famous.{" "}
          <span className="font-bold text-foreground">
            They had strong relationships.
          </span>{" "}
          This pack builds them.
        </p>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left mt-3">
          1 custom shirt with your words → your friend reads it → they text you back →{" "}
          <span className="font-bold text-primary">both your brains flood with serotonin.</span>{" "}
          Plus <span className="font-bold text-primary">11 meals donated</span> through Feeding America.{" "}
          Total value: <span className="font-bold text-foreground line-through">$333</span>.{" "}
          You pay <span className="font-bold text-primary">$111</span>.
        </p>
      </div>
    </motion.div>
  );
};

export default GrokHeroSection;
