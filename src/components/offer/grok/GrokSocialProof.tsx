import { motion } from "framer-motion";
import { Users, Heart } from "lucide-react";

const GrokSocialProof = () => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Testimonial */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-soft mb-4">
        <p className="text-sm md:text-base italic text-foreground leading-relaxed">
          "This pack turned my bad days into blessings — and feeding those meals?{" "}
          <span className="font-bold text-primary">Pure joy!</span>"
        </p>
        <p className="text-xs text-muted-foreground mt-2 font-medium">
          — Sarah, 1,200 BCs
        </p>
      </div>

      {/* Metrics */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4 text-primary" />
          <span>
            <span className="font-bold text-foreground">2,340</span> challengers
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Heart className="w-4 h-4 text-primary" />
          <span>
            <span className="font-bold text-foreground">25k+</span> meals donated
          </span>
        </div>
      </div>

      <p className="text-center text-sm font-semibold text-primary mt-3">
        Your turn! 🙌
      </p>
    </motion.div>
  );
};

export default GrokSocialProof;
