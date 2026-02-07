import { motion } from "framer-motion";
import { Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const GratitudeIntro = () => {
  const handleCheckout = () => {
    if (import.meta.env.DEV) {
      console.log("Redirecting to Stripe checkout for $111 pack");
    }
  };

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

      {/* CTA Button */}
      <Button
        onClick={handleCheckout}
        className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
      >
        <Crown className="w-5 h-5 mr-2" />
        Get NOW the Gratitude Brain Hack Pack
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );
};

export default GratitudeIntro;
