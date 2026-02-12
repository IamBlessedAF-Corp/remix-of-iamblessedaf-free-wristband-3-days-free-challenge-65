import { motion } from "framer-motion";
import { Gift, ArrowRight, Truck, FlaskConical, ChevronDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import productWristbands from "@/assets/product-wristbands.avif";
import logo from "@/assets/logo.png";
import ImageZoomModal from "./ImageZoomModal";
import { useState } from "react";
import RiskReversalGuarantee from "./RiskReversalGuarantee";
import UrgencyBanner from "./UrgencyBanner";
import { useMovementCount } from "@/hooks/useMovementCount";

interface FreeWristbandStepProps {
  onCheckout: () => void;
  onSkip: () => void;
  senderName?: string | null;
}

const FreeWristbandStep = ({ onCheckout, onSkip, senderName }: FreeWristbandStepProps) => {
  const [zoomed, setZoomed] = useState(false);
  const { displayCount } = useMovementCount();

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
          {senderName ? `${senderName} blessed you with a FREE Wristband 🎁` : "Someone blessed you with a FREE Wristband 🎁"}
        </div>
      </motion.div>

      {/* Social proof counter */}
      <motion.div
        className="text-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-xs text-muted-foreground">
          🙏 <span className="font-semibold text-foreground">{displayCount.toLocaleString()} people</span> joined the movement this week
        </p>
      </motion.div>

      {/* Intro copy */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
          Congratulations — You're About to Become a{" "}
          <span className="text-primary">Neuro-Hacker</span> 🧠
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
          From now on, every time you look at your wrist, your brain will release{" "}
          <span className="font-bold text-foreground">happiness chemicals</span>.
          This FREE wristband is your daily gratitude trigger — backed by neuroscience.
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
                Waterproof Nylon · One-Size-Fits-All · Debossed
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">FREE</span>
              <span className="text-base text-muted-foreground line-through">$11</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <Truck className="w-3.5 h-3.5 text-primary" />
              <span>Ships worldwide 🌍 · Waterproof nylon · One-size-fits-all</span>
            </div>
          </div>
        </div>
      </motion.div>


      {/* ═══ THE GRATITUDE ENGINE LOOP™ ═══ */}
      <motion.div
        className="mb-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/5 overflow-hidden p-6 text-center space-y-5"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <img src={logo} alt="IamBlessedAF" className="h-8 mx-auto" />
        <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
          THE <span className="text-primary">GRATITUDE ENGINE</span> LOOP™
        </h2>

        {/* Huberman Clip */}
        <div className="max-w-sm mx-auto rounded-xl overflow-hidden border border-border/50 shadow-sm">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/ph1BuMRFJ88"
              title="Huberman on Gratitude"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>

        {/* Bridge copy */}
        <div className="space-y-3 max-w-sm mx-auto">
          <h3 className="text-lg md:text-xl font-extrabold leading-tight text-foreground">
            The Practical Implementation of{" "}
            <span className="text-primary">The Biggest Andrew Huberman Discovery</span>{" "}
            in the Last 18 Months.
          </h3>
          <p className="text-sm font-semibold text-foreground/90 leading-snug">
            Dr. Hawkins' (PhD) Research affirms it could make you up to{" "}
            <motion.span
              className="text-primary inline-block"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
            >
              27× Happier
            </motion.span>.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The <strong className="text-foreground">Neuro-Hack</strong> to spike{" "}
            <strong className="text-primary">Dopamine & Serotonin</strong> (Overall Well-Being) — pre-built into a{" "}
            <strong className="text-foreground">trigger</strong>,{" "}
            <strong className="text-foreground">habit-forming system</strong> &{" "}
            <strong className="text-primary">brand</strong>.
          </p>
        </div>

        {/* Science of Gratitude — collapsible */}
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-center gap-2 bg-card border border-border/50 rounded-xl px-4 py-2.5 mx-auto max-w-xs shadow-sm hover:shadow-md transition-shadow">
              <FlaskConical className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Science of Gratitude</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">8 peer-reviewed studies · Huberman Lab</p>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 space-y-2.5 text-left">
              {[
                { title: "Receiving gratitude > giving gratitude", source: "Huberman Lab Podcast #47" },
                { title: "Gratitude spikes serotonin & dopamine", source: "Zahn et al., 2009 — NeuroImage" },
                { title: "3 minutes is the effective threshold", source: "Emmons & McCullough, 2003" },
                { title: "#1 predictor of lifelong happiness", source: "Harvard Grant Study (75+ years)" },
                { title: "Gratitude rewires neural pathways", source: "Kini et al., 2016 — NeuroImage" },
                { title: "Up to 27× consciousness elevation", source: "Dr. David Hawkins — Power vs. Force" },
                { title: "Reduces cortisol by 23%", source: "McCraty et al., 1998" },
                { title: "Habit formation in 21 days", source: "Lally et al., 2010" },
              ].map((study, i) => (
                <div key={i} className="bg-card/80 border border-border/40 rounded-lg p-3 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{study.title}</p>
                    <p className="text-[10px] text-primary font-semibold mt-0.5">{study.source}</p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
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
            <span>🎁</span>
            <span>100% FREE — No credit card required</span>
          </div>
          <div className="h-px bg-border/40" />
          <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground text-center">
            <p>📦 7–14 day delivery · Waterproof nylon · One-size-fits-all</p>
            <p>🍽 11 meals donated to Feeding America with every wristband</p>
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
