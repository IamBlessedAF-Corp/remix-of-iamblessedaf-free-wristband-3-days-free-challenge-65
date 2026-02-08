import { motion } from "framer-motion";

const Grok1111HeroSection = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Benefit-driven headline — ROI math */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        $1,111 ÷ 365 ={" "}
        <span className="text-primary">$3.04/day</span> to Become the{" "}
        <span className="text-primary">Gratitude Evangelist</span> Your Circle Needs
      </h1>

      {/* Epiphany Bridge — math-heavy */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto shadow-soft">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
          You've seen what one shirt does.{" "}
          <span className="font-bold text-foreground">
            Now imagine 7 black shirts for every day of the week + 11 custom white shirts
            for the 11 people who shaped your life.
          </span>{" "}
          111 wristbands to hand out to family, friends, coworkers — turning every interaction into a gratitude trigger.
        </p>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left mt-3">
          The full Evangelist stack:{" "}
          <span className="font-bold text-foreground">7 black shirts + 11 custom friend shirts + 111 wristbands</span>{" "}
          + <span className="font-bold text-primary">11,111 meals donated</span> instantly.
          Total value: <span className="font-bold text-foreground line-through">$2,222</span>.{" "}
          You pay <span className="font-bold text-primary">$1,111</span> — 50% off.
        </p>
      </div>
    </motion.div>
  );
};

export default Grok1111HeroSection;
