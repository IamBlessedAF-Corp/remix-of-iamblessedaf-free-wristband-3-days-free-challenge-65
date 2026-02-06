import { motion } from "framer-motion";
import { Diamond, Trophy, Flame, Target, ArrowRight, Check, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Offer444 = () => {
  const handleCheckout = () => {
    // Placeholder for Stripe checkout
    console.log("Redirecting to Stripe checkout for $444 pack");
  };

  const benefits = [
    "Complete Premium Merchandise Set",
    "1-on-1 Gratitude Coaching Session",
    "Personalized Blessing Strategy Call",
    "Lifetime VIP Community Access",
    "Early Access to All Future Products",
    "Exclusive 'Gratitude Master' Title",
    "Annual Blessing Challenge Entry (Forever)",
    "Custom Engraved Blessing Coin",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Premium background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Unlock Badge */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-glow">
              <Trophy className="w-4 h-4" />
              11-Day Challenge Champion — Elite Access Unlocked
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={logo}
              alt="I am Blessed AF"
              className="w-full max-w-sm h-auto object-contain mx-auto mb-6"
            />
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Habit Lock Pack
            </span>
            <h1 className="text-3xl md:text-5xl font-bold mt-2 mb-4">
              The Strongest Reinforcement
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              You've mastered the habit. Now lock it in for life with our most powerful transformation package.
            </p>
          </motion.div>

          {/* Product Card */}
          <motion.div
            className="bg-card rounded-3xl shadow-premium overflow-hidden border-2 border-primary mb-8 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Elite Badge */}
            <div className="absolute top-4 right-4 z-10">
              <motion.div 
                className="bg-foreground text-background px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Diamond className="w-3 h-3" />
                ELITE TIER
              </motion.div>
            </div>

            {/* Product Icons */}
            <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent p-10 md:p-14">
              <div className="flex justify-center gap-5">
                <motion.div
                  className="bg-background rounded-2xl p-6 shadow-premium"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Diamond className="w-12 h-12 text-primary" />
                </motion.div>
                <motion.div
                  className="bg-background rounded-2xl p-6 shadow-premium"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
                >
                  <Flame className="w-12 h-12 text-primary" />
                </motion.div>
                <motion.div
                  className="bg-background rounded-2xl p-6 shadow-premium"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.8 }}
                >
                  <Target className="w-12 h-12 text-primary" />
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-10">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-5xl md:text-6xl font-bold text-foreground">$444</span>
                  <span className="text-muted-foreground text-lg">one-time</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  + Priority express shipping worldwide
                </p>
              </div>

              {/* Benefits */}
              <div className="grid md:grid-cols-2 gap-4 mb-10">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.06 }}
                  >
                    <div className="bg-primary rounded-full p-1 shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={handleCheckout}
                className="w-full h-16 text-xl font-bold bg-foreground hover:bg-foreground/90 text-background transition-all duration-300 rounded-xl group"
              >
                <Zap className="w-6 h-6 mr-2 group-hover:animate-pulse" />
                Unlock Elite Access
                <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                <span>🔒 Secure checkout</span>
                <span>•</span>
                <span>📦 Ships within 24 hours</span>
                <span>•</span>
                <span>💬 Personal onboarding</span>
              </div>
            </div>
          </motion.div>

          {/* Skip Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <a
              href="/challenge/thanks"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Not ready yet →
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Offer444;
