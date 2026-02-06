import { motion } from "framer-motion";
import { Package, QrCode, Zap, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Offer22 = () => {
  const handleCheckout = () => {
    // Placeholder for Stripe checkout
    console.log("Redirecting to Stripe checkout for $22 pack");
    // window.location.href = stripeCheckoutUrl;
  };

  const benefits = [
    "2x I am Blessed AF Wristbands",
    "QR Confirmation Cards (pack of 10)",
    "Exclusive Blessed Member Badge",
    "Priority Daily Prompts",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
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
              Starter Gift Pack
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Multiply Your Impact
            </h1>
            <p className="text-muted-foreground">
              Physical tools to spread blessings in the real world.
            </p>
          </motion.div>

          {/* Product Card */}
          <motion.div
            className="bg-card rounded-3xl shadow-premium overflow-hidden border border-border/50 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Product Image/Icons */}
            <div className="bg-gradient-to-br from-primary/10 to-accent p-8 md:p-12">
              <div className="flex justify-center gap-6">
                <motion.div
                  className="bg-background rounded-2xl p-6 shadow-soft"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Package className="w-12 h-12 text-primary" />
                </motion.div>
                <motion.div
                  className="bg-background rounded-2xl p-6 shadow-soft"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <QrCode className="w-12 h-12 text-primary" />
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl md:text-5xl font-bold text-foreground">$22</span>
                  <span className="text-muted-foreground">one-time</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  + Free shipping
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="bg-primary/10 rounded-full p-1">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={handleCheckout}
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow transition-all duration-300 rounded-xl"
              >
                <Zap className="w-5 h-5 mr-2" />
                Get Your Starter Pack
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Trust */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                🔒 Secure checkout powered by Stripe
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
              No thanks, continue without physical pack →
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Offer22;
