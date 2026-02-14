import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Repeat, MessageCircle, Gift, Users, ArrowRight, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import logo from "@/assets/logo.png";
import DownsellModal from "@/components/offer/DownsellModal";

const OfferMonthly = () => {
  const [showDownsell, setShowDownsell] = useState(false);
  const navigate = useNavigate();
  const { startCheckout, loading } = useStripeCheckout();

  const handleCheckout = () => {
    startCheckout("monthly-11");
  };

  const benefits = [
    {
      icon: MessageCircle,
      title: "Premium Daily Prompts",
      description: "Thoughtful, personalized gratitude prompts each morning",
    },
    {
      icon: Users,
      title: "Private Community",
      description: "Connect with other blessing champions worldwide",
    },
    {
      icon: Gift,
      title: "Early Drops",
      description: "First access to new products, challenges, and features",
    },
    {
      icon: Repeat,
      title: "Monthly Challenges",
      description: "Exclusive challenges with premium prizes",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <GamificationHeader />
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
              Monthly Membership
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              $11/mo = $0.36/day to Stay{" "}
              <span className="text-primary">27× Happier</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Less than a coffee. Daily premium prompts + private community + first access to drops. Cancel anytime — keep the brain rewire.
            </p>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            className="bg-card rounded-3xl shadow-premium overflow-hidden border border-border/50 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 via-accent to-primary/10 p-6 text-center">
              <motion.div
                className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
                Cancel anytime, no commitment
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl md:text-6xl font-bold text-foreground">$11</span>
                  <span className="text-xl text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  That's $0.36/day — less than a coffee. ROI: 27× happier, every single day.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-secondary/30 rounded-xl"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="bg-primary/10 rounded-lg p-2 shrink-0">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full min-h-[56px] h-auto py-3 px-4 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow transition-all duration-300 rounded-xl disabled:opacity-70 disabled:animate-none text-center leading-tight"
              >
                {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Repeat className="w-5 h-5 mr-2" />}
                {loading ? "Creating checkout…" : "YES! Lock In My Daily Brain Rewire — $11/mo"}
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>

              {/* Trust indicators */}
              <div className="flex flex-col items-center gap-2 mt-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-primary" />
                    No commitment
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-primary" />
                    Cancel anytime
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-primary" />
                    Instant access
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  🔒 Secure recurring billing via Stripe
                </p>
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
              href="/offer/111"
              onClick={(e) => { e.preventDefault(); setShowDownsell(true); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Not right now →
            </a>
          </motion.div>

          <DownsellModal
            open={showDownsell}
            onClose={() => setShowDownsell(false)}
            onAccept={() => { setShowDownsell(false); navigate("/offer/11mo"); }}
            onDecline={() => { setShowDownsell(false); navigate("/offer/111"); }}
          />
        </div>
      </div>
    </div>
  );
};

export default OfferMonthly;
