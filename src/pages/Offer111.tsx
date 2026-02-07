import { motion } from "framer-motion";
import { Crown, Shield, Star, Sparkles, ArrowRight, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import GratitudeIntro from "@/components/offer/GratitudeIntro";
import logo from "@/assets/logo.png";

const Offer111 = () => {
  const handleCheckout = () => {
    // Placeholder for Stripe checkout
    if (import.meta.env.DEV) {
      console.log("Redirecting to Stripe checkout for $111 pack");
    }
  };

  const benefits = [
    "Premium Blessed AF Hoodie",
    "Full Wristband Collection (5 colors)",
    "Personalized Blessing Cards (25 pack)",
    "Exclusive 'Founding Blesser' Badge",
    "VIP Challenge Access Forever",
    "Private Community Access",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Unlock Badge */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              <Lock className="w-4 h-4" />
              Unlocked! You completed the 3-Day Challenge
            </div>
          </motion.div>

          {/* Gratitude Intro Section */}
          <GratitudeIntro />

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
              Identity & Impact Pack
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Lock This as Your Identity
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              You've proven gratitude works. Now make it a permanent part of who you are.
            </p>
          </motion.div>

          {/* Product Card */}
          <motion.div
            className="bg-card rounded-3xl shadow-premium overflow-hidden border-2 border-primary/20 mb-8 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Premium Badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                MOST POPULAR
              </div>
            </div>

            {/* Product Icons */}
            <div className="bg-gradient-to-br from-primary/15 to-accent p-8 md:p-12">
              <div className="flex justify-center gap-4">
                <motion.div
                  className="bg-background rounded-2xl p-5 shadow-soft"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Crown className="w-10 h-10 text-primary" />
                </motion.div>
                <motion.div
                  className="bg-background rounded-2xl p-5 shadow-soft"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                >
                  <Shield className="w-10 h-10 text-primary" />
                </motion.div>
                <motion.div
                  className="bg-background rounded-2xl p-5 shadow-soft"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.6 }}
                >
                  <Sparkles className="w-10 h-10 text-primary" />
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl md:text-5xl font-bold text-foreground">$111</span>
                  <span className="text-muted-foreground">one-time</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  + Free express shipping
                </p>
              </div>

              {/* Benefits */}
              <div className="grid md:grid-cols-2 gap-3 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.08 }}
                  >
                    <div className="bg-primary/10 rounded-full p-1 shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground text-sm">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={handleCheckout}
                className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
              >
                <Crown className="w-5 h-5 mr-2" />
                Claim Your Identity Pack
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Trust */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                🔒 Secure checkout • Ships within 48 hours
              </p>
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
              Maybe later →
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Offer111;
