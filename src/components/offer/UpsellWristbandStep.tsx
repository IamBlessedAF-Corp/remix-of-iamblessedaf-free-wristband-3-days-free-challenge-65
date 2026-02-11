import { motion } from "framer-motion";
import { Crown, ArrowRight, Sparkles, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WristbandProductCard from "./WristbandProductCard";
import RiskReversalGuarantee from "./RiskReversalGuarantee";
import ResearchList from "./ResearchList";
import hawkinsScale from "@/assets/hawkins-scale.jpg";
import UrgencyBanner from "./UrgencyBanner";
import EpiphanyBridge from "./EpiphanyBridge";
import ImpactCounter from "./ImpactCounter";
import ViralShareNudge from "./ViralShareNudge";

interface UpsellWristbandStepProps {
  onCheckout: () => void;
  onSkip: () => void;
  loading?: boolean;
}

const UpsellWristbandStep = ({ onCheckout, onSkip, loading = false }: UpsellWristbandStepProps) => {
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
          Keep One. <span className="text-primary">Gift Two.</span>{" "}
          <span className="text-primary">Rekindle 2 Relationships.</span>
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-2 leading-relaxed">
          Think of 2 people who changed your life. A friend who was there. A family member who believed in you.{" "}
          <span className="font-bold text-foreground">Send them a wristband</span> — it's the simplest way to say
          "I'm grateful for you."  When they wear it, they think of you.
          When they feel grateful,{" "}
          <span className="font-bold text-foreground">YOUR brain rewards you too</span>{" "}
          — that's the 27× serotonin boost Huberman found.
        </p>
        <p className="text-xs text-muted-foreground max-w-md mx-auto mt-3 italic">
          💔 Don't let the people who matter most wonder if you care. One wristband can reopen a conversation,
          heal a distance, and start a gratitude loop that changes both of you.
        </p>
        <div className="inline-flex items-center gap-2 bg-accent/50 text-foreground px-4 py-2 rounded-full text-sm font-semibold mt-2">
          <Heart className="w-4 h-4 text-primary" />
          + 22 Meals Donated to Feeding America
        </div>
      </motion.div>

      {/* Epiphany Bridge — Brunson storytelling */}
      <EpiphanyBridge />

      {/* Comparison */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {/* Original — clickable */}
          <button
            onClick={onSkip}
            className="bg-card border border-border/50 rounded-xl p-4 text-center hover:border-border transition-colors cursor-pointer"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Just For Me</p>
            <p className="text-lg font-bold text-foreground">1 Wristband</p>
            <p className="text-sm text-muted-foreground mt-1">FREE + $9.95 ship</p>
            <p className="text-xs text-muted-foreground mt-2">0 meals donated</p>
          </button>
          {/* Upgrade */}
          <button
            onClick={onCheckout}
            className="bg-card border-2 border-primary rounded-xl p-4 text-center relative hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Best Value
            </div>
            <p className="text-xs text-primary uppercase tracking-wider mb-2 font-semibold">Pay It Forward</p>
            <p className="text-lg font-bold text-foreground">3 Wristbands</p>
            <p className="text-sm text-primary font-bold mt-1">$22 · FREE ship</p>
            <p className="text-xs text-primary font-semibold mt-2">🍽 22 meals donated</p>
          </button>
        </div>
      </motion.div>

      {/* Product heading */}
      <p className="text-center text-3xl md:text-4xl font-black text-primary mb-2">
        YOUR DAILY HAPPINESS TRIGGER
      </p>
      <p className="text-center text-sm text-muted-foreground max-w-md mx-auto mb-4">
        3 silicone wristbands. Every time you glance at your wrist, your brain fires a gratitude micro-moment.{" "}
        <span className="font-bold text-foreground">That's happiness for $0.02/day.</span>
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
          disabled={loading}
          className="w-full h-16 text-base md:text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl px-4 disabled:opacity-70 disabled:animate-none"
        >
          {loading ? <Loader2 className="w-5 h-5 mr-2 flex-shrink-0 animate-spin" /> : <Crown className="w-5 h-5 mr-2 flex-shrink-0" />}
          <span>{loading ? "Creating checkout…" : "Upgrade to 3 Wristbands — $22"}</span>
          {!loading && <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />}
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
          disabled={loading}
          className="w-full h-16 text-base md:text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl px-4 disabled:opacity-70 disabled:animate-none"
        >
          {loading ? <Loader2 className="w-5 h-5 mr-2 flex-shrink-0 animate-spin" /> : <Crown className="w-5 h-5 mr-2 flex-shrink-0" />}
          <span>{loading ? "Creating checkout…" : "Upgrade to 3 Wristbands — $22"}</span>
          {!loading && <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />}
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
          disabled={loading}
          className="w-full h-16 text-base md:text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl px-4 disabled:opacity-70 disabled:animate-none"
        >
          {loading ? <Loader2 className="w-5 h-5 mr-2 flex-shrink-0 animate-spin" /> : <Crown className="w-5 h-5 mr-2 flex-shrink-0" />}
          <span>{loading ? "Creating checkout…" : "Upgrade to 3 Wristbands — $22"}</span>
          {!loading && <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />}
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

      {/* Live Impact Counter */}
      <ImpactCounter />

      {/* Viral Share Nudge */}
      <ViralShareNudge />

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
          No thanks, I'll keep just mine →
        </button>
        <p className="text-[11px] text-muted-foreground/60 mt-2 max-w-xs mx-auto">
          You'll still get your FREE wristband. But your 2 friends won't know you thought of them today.
        </p>
      </motion.div>
    </>
  );
};

export default UpsellWristbandStep;
