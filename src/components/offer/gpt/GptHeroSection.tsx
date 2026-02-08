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
      {/* Hook — emotion-driven, imaginative */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        Picture Your Best Friend's Face When They Open a Shirt with{" "}
        <span className="text-primary">Your Words on It</span> — That Feeling? It Lasts Forever.
      </h1>

      {/* Creative Storytelling Bridge — warm, visual, heart-first */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto shadow-soft">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Your Story Starts Here</span>
        </div>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
          You just proved something beautiful — you can rewire your brain with gratitude in just 3 days.{" "}
          <span className="font-bold text-foreground">
            Now imagine turning that spark into something you can touch, wear, and share.
          </span>
        </p>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left mt-3">
          Write a heartfelt message. We print it on a custom shirt for your best friend. When they open it,
          when they <em>feel</em> your words —{" "}
          <span className="font-bold text-foreground">that's the moment both your brains light up.</span>{" "}
          And 11 people get fed through Feeding America. All from one beautiful act of gratitude.
        </p>
      </div>
    </motion.div>
  );
};

export default GptHeroSection;
