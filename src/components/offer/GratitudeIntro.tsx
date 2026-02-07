import { motion } from "framer-motion";
import hawkinsScale from "@/assets/hawkins-scale.jpg";

const GratitudeIntro = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        <span className="text-3xl md:text-4xl">🎉</span> Congrats! You Gave the 1st Step to Rewire Your{" "}
        <span className="text-primary">BRAIN</span> to Feel Happier!{" "}
        <span className="text-3xl md:text-4xl">🧠</span>
      </h2>

      {/* Quotes */}
      <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-4 shadow-soft">
        <p className="text-sm md:text-base italic text-foreground leading-relaxed">
          "Most people live in survival emotions like fear, anger, guilt, shame"
        </p>
        <footer className="mt-2 text-xs md:text-sm text-muted-foreground font-semibold">
          — Dr Joe Dispenza
        </footer>
      </blockquote>

      <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-6 shadow-soft">
        <p className="text-sm md:text-base italic text-foreground leading-relaxed">
          "Gratitude is the fastest & repeatable way to shift emotional state by changing physiology and perception. Make it a daily ritual."
        </p>
        <footer className="mt-2 text-xs md:text-sm text-muted-foreground font-semibold">
          — Tony Robbins
        </footer>
      </blockquote>

      {/* CTA transition */}
      <p className="text-lg md:text-xl font-bold text-foreground mb-1">
        Wanna achieve it Faster?
      </p>
      <p className="text-sm text-muted-foreground">
        Hack your environment for Gratitude with the
      </p>
    </motion.div>
  );
};

export default GratitudeIntro;
