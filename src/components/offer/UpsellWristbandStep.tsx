import { motion } from "framer-motion";
import { Crown, ArrowRight, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import WristbandProductCard from "./WristbandProductCard";
import RiskReversalGuarantee from "./RiskReversalGuarantee";
import ResearchList from "./ResearchList";
import hawkinsScale from "@/assets/hawkins-scale.jpg";
import UrgencyBanner from "./UrgencyBanner";

interface UpsellWristbandStepProps {
  onCheckout: () => void;
  onSkip: () => void;
}

const UpsellWristbandStep = ({ onCheckout, onSkip }: UpsellWristbandStepProps) => {
  return (
    <>
      {/* Upsell badge */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          Wait! Upgrade & unlock FREE shipping 🚀
        </div>
      </motion.div>

      {/* Upgrade headline */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
          Upgrade to <span className="text-primary">3 Wristbands</span> for $22{" "}
          <span className="text-primary">+ FREE Shipping</span> 🧠
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-2 leading-relaxed">
          Instead of 1 wristband + $9.95 shipping, get{" "}
          <span className="font-bold text-foreground">3 wristbands with FREE US shipping</span>{" "}
          — keep one, gift two to people you're grateful for.
        </p>
        <div className="inline-flex items-center gap-2 bg-accent/50 text-foreground px-4 py-2 rounded-full text-sm font-semibold mt-2">
          <Heart className="w-4 h-4 text-primary" />
          + 22 Meals Donated to Feeding America
        </div>
      </motion.div>

      {/* Comparison */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {/* Original */}
          <div className="bg-card border border-border/50 rounded-xl p-4 text-center opacity-60">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Your Current</p>
            <p className="text-lg font-bold text-foreground">1 Wristband</p>
            <p className="text-sm text-muted-foreground mt-1">FREE + $9.95 ship</p>
            <p className="text-xs text-muted-foreground mt-2">0 meals donated</p>
          </div>
          {/* Upgrade */}
          <div className="bg-card border-2 border-primary rounded-xl p-4 text-center relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Best Value
            </div>
            <p className="text-xs text-primary uppercase tracking-wider mb-2 font-semibold">Upgrade</p>
            <p className="text-lg font-bold text-foreground">3 Wristbands</p>
            <p className="text-sm text-primary font-bold mt-1">$22 · FREE ship</p>
            <p className="text-xs text-primary font-semibold mt-2">🍽 22 meals donated</p>
          </div>
        </div>
      </motion.div>

      {/* Product heading */}
      <p className="text-center text-3xl md:text-4xl font-black text-primary mb-2">
        DAILY TRIGGER WRISTBANDS
      </p>
      <p className="text-center text-sm text-muted-foreground max-w-md mx-auto mb-4">
        3 silicone wristbands that trigger a gratitude micro-moment every time you glance at your wrist.{" "}
        <span className="font-bold text-foreground">Cost per gratitude hack: $0.02/day.</span>
      </p>

      {/* Wristband Product */}
      <WristbandProductCard delay={0.4} />

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <UrgencyBanner variant="wristbands" />
        <Button
          onClick={onCheckout}
          className="w-full h-16 text-base md:text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl px-4"
        >
          <Crown className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>Upgrade to 3 Wristbands — $22</span>
          <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4">
          🔒 Secure checkout • Free US Shipping • 22 meals donated instantly
        </p>
        <RiskReversalGuarantee />
      </motion.div>

      {/* Science Section */}
      <motion.div
        className="text-center mt-12 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-6 shadow-soft">
          <p className="text-sm md:text-base italic text-foreground leading-relaxed">
            "Gratitude isn't created by affirmations, it's activated by receiving genuine appreciation."
          </p>
          <footer className="mt-3 text-xs md:text-sm text-muted-foreground font-semibold">
            — Andrew Huberman, Neuroscientist
          </footer>
        </blockquote>

        <p className="text-base md:text-lg text-muted-foreground mb-2 max-w-lg mx-auto">
          Dr. Hawkins — PhD Psychiatrist Research illustrated by this emotional scale, the frequency of{" "}
          <span className="font-bold text-foreground">shame is 20 Hz</span> and{" "}
          <span className="font-bold text-foreground">Joy is 540 Hz</span>.
        </p>
        <p className="text-base md:text-lg text-muted-foreground mb-2 max-w-lg mx-auto">
          Gratitude makes you feel the emotion of <span className="font-bold text-foreground">Joy</span>.
        </p>
        <p className="text-xl md:text-2xl font-bold text-primary mb-6 max-w-lg mx-auto">
          Hack your Brain to feel up 27x HAPPIER
        </p>

        <motion.div
          className="max-w-lg mx-auto mb-6 rounded-2xl overflow-hidden border border-border/50 shadow-soft"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <img
            src={hawkinsScale}
            alt="Dr. Hawkins Emotional Guidance Scale"
            className="w-full h-auto object-contain"
            loading="lazy"
          />
        </motion.div>
      </motion.div>

      {/* Second CTA */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Button
          onClick={onCheckout}
          className="w-full h-16 text-base md:text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl px-4"
        >
          <Crown className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>Upgrade to 3 Wristbands — $22</span>
          <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4">
          🔒 Secure checkout • Free US Shipping
        </p>
        <RiskReversalGuarantee />
      </motion.div>

      {/* Research List */}
      <ResearchList delay={1.1} />

      {/* CTA after research */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Button
          onClick={onCheckout}
          className="w-full h-16 text-base md:text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl px-4"
        >
          <Crown className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>Upgrade to 3 Wristbands — $22</span>
          <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4">
          🔒 Secure checkout • Free US Shipping
        </p>
        <RiskReversalGuarantee />
      </motion.div>

      {/* Trust Disclaimer */}
      <motion.div
        className="mb-8 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        <div className="border border-border/50 rounded-xl p-5 space-y-3 bg-card">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
            <span>✅</span>
            <span>30-Day Money-Back Guarantee — No questions asked</span>
          </div>
          <div className="h-px bg-border/40" />
          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground text-center">
            <p>🔒 256-bit SSL Encrypted · Secure Payment · Your data is never shared</p>
            <p>📦 100% Satisfaction Guaranteed · Free US Shipping · Intl $14.95 Flat · 7–14 day delivery</p>
            <p>💳 One-time payment. No subscriptions. No hidden fees.</p>
            <p>🍽 22 meals donated to Feeding America with every pack</p>
          </div>
        </div>
      </motion.div>

      {/* Skip */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.35 }}
      >
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          No thanks, I'll keep my 1 free wristband →
        </button>
      </motion.div>
    </>
  );
};

export default UpsellWristbandStep;
