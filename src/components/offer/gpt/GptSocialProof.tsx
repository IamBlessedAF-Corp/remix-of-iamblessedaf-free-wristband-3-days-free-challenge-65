import { motion } from "framer-motion";
import { Heart, MessageCircle, Star } from "lucide-react";

const GptSocialProof = () => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Emotional testimonials — story-focused */}
      <p className="text-center text-lg font-bold text-foreground mb-3">
        Real Stories, Real Tears (the Good Kind)
      </p>

      <div className="space-y-3 mb-4">
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Jessica R.</p>
              <p className="text-[10px] text-muted-foreground">Sent the shirt to her college roommate</p>
            </div>
          </div>
          <p className="text-sm italic text-foreground leading-relaxed">
            "She called me <em>sobbing</em> — said she'd been having the worst month and my message on that shirt was exactly what she needed. We talked for two hours.{" "}
            <span className="font-bold text-primary">I haven't felt that connected to someone in years.</span>"
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">David K.</p>
              <p className="text-[10px] text-muted-foreground">Gifted to his brother after losing their mom</p>
            </div>
          </div>
          <p className="text-sm italic text-foreground leading-relaxed">
            "My brother doesn't do emotions. But when he opened that shirt and read my message, he just stood there for a minute. Then he hugged me.{" "}
            <span className="font-bold text-primary">We don't need words when the shirt says it all.</span>"
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Aaliyah M.</p>
              <p className="text-[10px] text-muted-foreground">Wears her shirt every "bad day Monday"</p>
            </div>
          </div>
          <p className="text-sm italic text-foreground leading-relaxed">
            "I put it on when I'm struggling. It reminds me that I <em>chose</em> gratitude.{" "}
            <span className="font-bold text-primary">My coworkers started asking about it — now three of them joined the challenge.</span>"
          </p>
        </div>
      </div>

      {/* Soft community metrics */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
        <p className="text-sm font-bold text-foreground mb-1">
          A growing community of beautiful humans ✨
        </p>
        <p className="text-xs text-muted-foreground">
          2,340+ people have joined · 25,000+ meals donated · Countless friendships deepened
        </p>
      </div>
    </motion.div>
  );
};

export default GptSocialProof;
