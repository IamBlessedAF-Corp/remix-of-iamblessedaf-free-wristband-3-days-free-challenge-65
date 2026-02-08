import { motion } from "framer-motion";
import { Users, Heart, Star, TrendingUp } from "lucide-react";

const GrokSocialProof = () => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Testimonials */}
      <div className="space-y-3 mb-4">
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Sarah M.</p>
              <p className="text-[10px] text-muted-foreground">1,200 BCs · Verified Buyer</p>
            </div>
          </div>
          <p className="text-sm italic text-foreground leading-relaxed">
            "This pack turned my bad days into blessings — and feeding those meals?{" "}
            <span className="font-bold text-primary">Pure joy!</span> My friend cried when she opened the custom shirt."
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Marcus T.</p>
              <p className="text-[10px] text-muted-foreground">890 BCs · Verified Buyer</p>
            </div>
          </div>
          <p className="text-sm italic text-foreground leading-relaxed">
            "I wear my shirt every Monday. People ask about it, I explain gratitude, and{" "}
            <span className="font-bold text-primary">the conversation changes everything.</span> It's like a cheat code for connection."
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center shadow-soft">
          <Users className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">2,340</p>
          <p className="text-[10px] text-muted-foreground">challengers</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center shadow-soft">
          <Heart className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">25k+</p>
          <p className="text-[10px] text-muted-foreground">meals donated</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-center shadow-soft">
          <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">94%</p>
          <p className="text-[10px] text-muted-foreground">feel happier</p>
        </div>
      </div>

      <p className="text-center text-sm font-semibold text-primary">
        Join them — your turn! 🙌
      </p>
    </motion.div>
  );
};

export default GrokSocialProof;
