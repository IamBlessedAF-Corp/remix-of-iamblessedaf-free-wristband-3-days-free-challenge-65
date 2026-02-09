import { motion } from "framer-motion";
import { Gift, ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import productWristbands from "@/assets/product-wristbands.avif";
import ImageZoomModal from "./ImageZoomModal";
import { useState } from "react";
import RiskReversalGuarantee from "./RiskReversalGuarantee";
import UrgencyBanner from "./UrgencyBanner";

interface FreeWristbandStepProps {
  onCheckout: () => void;
  onSkip: () => void;
}

const FreeWristbandStep = ({ onCheckout, onSkip }: FreeWristbandStepProps) => {
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      {zoomed && (
        <ImageZoomModal
          image={productWristbands}
          alt="Blessed Wristband"
          onClose={() => setZoomed(false)}
        />
      )}

      {/* Header badge */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
          <Gift className="w-4 h-4" />
          Someone blessed you with a FREE Wristband 🎁
        </div>
      </motion.div>

      {/* Intro copy */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
          Every Time You Look at Your Wrist, Your Brain Releases{" "}
          <span className="text-primary">Happiness Chemicals</span> 🧠
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          This FREE wristband is a daily gratitude trigger. Neuroscience shows the more you're reminded to feel grateful, the{" "}
          <span className="font-bold text-foreground">happier you become</span>.
          Wear it. Feel it. Change.
        </p>
      </motion.div>

      {/* Product card */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-soft">
          <div className="relative bg-secondary/30">
            <div
              className="cursor-zoom-in aspect-[4/3] flex items-center justify-center p-4"
              onClick={() => setZoomed(true)}
            >
              <img
                src={productWristbands}
                alt="Blessed Wristband — FREE gift"
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
            {/* FREE badge overlay */}
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              FREE Gift
            </div>
          </div>

          <div className="px-4 pb-5 pt-4 space-y-3 border-t border-border/30">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground tracking-tight leading-snug">
                1 Blessed Wristband
              </h3>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                NFC Tap · Share Custom Link · Waterproof Silicone
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">FREE</span>
              <span className="text-base text-muted-foreground line-through">$11</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <Truck className="w-3.5 h-3.5 text-primary" />
              <span>Ships worldwide 🌍 · Waterproof silicone · NFC enabled</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <UrgencyBanner variant="wristbands" />
        <Button
          onClick={onCheckout}
          className="w-full h-16 text-base md:text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl px-4"
        >
          <Gift className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>Claim My FREE Wristband</span>
          <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4">
          🔒 Secure checkout · Your wristband is 100% free — only cover delivery
        </p>
        <RiskReversalGuarantee />
      </motion.div>

      {/* Trust block */}
      <motion.div
        className="mt-8 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="border border-border/50 rounded-xl p-5 space-y-3 bg-card">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
            <span>✅</span>
            <span>30-Day Money-Back Guarantee — No questions asked</span>
          </div>
          <div className="h-px bg-border/40" />
          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground text-center">
            <p>🔒 256-bit SSL Encrypted · Secure Payment · Your data is never shared</p>
            <p>📦 7–14 day delivery · Waterproof silicone · NFC enabled</p>
            <p>💳 One-time shipping fee. No subscriptions. No hidden fees.</p>
          </div>
        </div>
      </motion.div>

      {/* Skip */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Maybe later →
        </button>
      </motion.div>
    </>
  );
};

export default FreeWristbandStep;
