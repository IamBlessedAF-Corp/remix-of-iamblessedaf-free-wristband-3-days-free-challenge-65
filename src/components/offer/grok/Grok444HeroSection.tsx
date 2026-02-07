import { motion } from "framer-motion";

const Grok444HeroSection = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Benefit-driven headline */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        <span className="text-3xl md:text-4xl">🧠</span> Make Gratitude Your{" "}
        <span className="text-primary">Daily Identity</span> — 5 Black Shirts to
        Hack Your Brain{" "}
        <span className="text-primary">Every Day of the Week</span>
      </h1>

      {/* Epiphany Bridge */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto shadow-soft">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
          You crushed the Challenge. You felt it. But here's what the research
          shows:{" "}
          <span className="font-bold text-foreground">
            identity shifts stick when they become your daily uniform
          </span>
          . One shirt is a statement. Five shirts? That's a lifestyle.
        </p>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left mt-3">
          Plus: 3 custom friend shirts to spread the movement, 14 wristbands to
          hack gratitude into{" "}
          <span className="font-bold text-foreground">
            every interaction
          </span>
          , and{" "}
          <span className="font-bold text-primary">44 meals donated</span>{" "}
          instantly.
        </p>
      </div>
    </motion.div>
  );
};

export default Grok444HeroSection;
