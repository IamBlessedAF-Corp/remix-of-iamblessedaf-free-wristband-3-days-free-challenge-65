import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const GptHeroSection = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hook — Version B: emotional storytelling (warm, visual) */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        Imagine Your Best Friend Opening a Package, Reading{" "}
        <span className="text-primary">Your Words</span>, and Crying{" "}
        <span className="text-primary">Happy Tears</span>
      </h1>

      {/* Storytelling Bridge — heart-first, simple */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto shadow-soft">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">This Is Real</span>
        </div>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
          You proved it in 3 days — gratitude changes how you feel.{" "}
          <span className="font-bold text-foreground">
            Now imagine turning that feeling into something your friend can touch.
          </span>
        </p>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left mt-3">
          We print YOUR words on a custom shirt. When they open it… when they read what you wrote about that one
          moment… their eyes water. They call you.{" "}
          <span className="font-bold text-foreground">BOTH your brains light up with pure joy.</span>{" "}
          That's not a product. That's a relationship deepened forever.
          Plus, <span className="font-bold text-primary">11 people get fed</span>.
        </p>
      </div>
    </motion.div>
  );
};

export default GptHeroSection;
