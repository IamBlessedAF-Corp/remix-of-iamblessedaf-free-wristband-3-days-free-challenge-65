import { motion } from "framer-motion";
import { Crown, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import GratitudeIntro from "@/components/offer/GratitudeIntro";
import DiscountBanner from "@/components/offer/DiscountBanner";
import ProductSections from "@/components/offer/ProductSections";
import logo from "@/assets/logo.png";

const Offer111 = () => {
  const handleCheckout = () => {
    // Placeholder for Stripe checkout
    if (import.meta.env.DEV) {
      console.log("Redirecting to Stripe checkout for $111 pack");
    }
  };

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

          {/* Logo + Gratitude Pack + Discount — unified block */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img
              src={logo}
              alt="I am Blessed AF"
              className="w-full max-w-sm h-auto object-contain mx-auto mb-1"
            />
            <p className="text-lg font-bold text-foreground mb-4">Gratitude Pack</p>

            {/* Discount inline */}
            <DiscountBanner />
          </motion.div>

          {/* Product Sections */}
          <ProductSections />

          {/* CTA */}
          <motion.div
            className="mt-10 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={handleCheckout}
              className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
            >
              <Crown className="w-5 h-5 mr-2" />
              Claim Your Gratitude Pack — $111
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              🔒 Secure checkout • FREE Shipping
            </p>
          </motion.div>

          {/* Skip Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
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
