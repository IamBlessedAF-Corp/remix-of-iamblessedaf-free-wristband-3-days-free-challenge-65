import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Heart, Quote } from "lucide-react";
import hawkinsImg from "@/assets/hawkins-scale.jpg";
import hubermanImg from "@/assets/author-huberman.jpg";
import wristbandImg from "@/assets/wristband-gift.avif";

interface GratitudeIntroScreenProps {
  onContinue: () => void;
  onSkip: () => void;
}

const GratitudeIntroScreen = ({ onContinue, onSkip }: GratitudeIntroScreenProps) => {
  return (
    <motion.div
      className="space-y-6 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hook headline */}
      <div className="text-center space-y-3">
        <motion.div
          className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <Brain className="w-8 h-8 text-primary" />
        </motion.div>

        <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
          Just 2 Minutes to Feel Up to{" "}
          <span className="text-primary">27× Happier</span>
        </h2>

        <p className="text-sm text-muted-foreground italic">
          — According to Dr. David Hawkins' Consciousness Scale
        </p>
      </div>

      {/* Hawkins scale image */}
      <motion.div
        className="rounded-xl overflow-hidden border border-border/50 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <img
          src={hawkinsImg}
          alt="Dr. Hawkins Consciousness Scale — Gratitude at 500"
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </motion.div>

      {/* Huberman quote */}
      <motion.div
        className="bg-secondary/50 rounded-xl p-4 border border-border/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-start gap-3">
          <img
            src={hubermanImg}
            alt="Andrew Huberman"
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 flex-shrink-0"
          />
          <div>
            <Quote className="w-4 h-4 text-primary/50 mb-1" />
            <p className="text-sm leading-relaxed text-foreground">
              "All the research shows we've been doing gratitude wrong. It's not about saying empty 'I am grateful for my mom.'
              The most effective way to feel grateful is by{" "}
              <span className="font-bold text-primary">receiving a real 'thank you'</span> from someone."
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-semibold">
              — Andrew Huberman, Neuroscientist
            </p>
          </div>
        </div>
      </motion.div>

      {/* The movement explanation */}
      <motion.div
        className="bg-accent/50 rounded-xl p-4 border border-primary/20 space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm font-bold">The Gratitude Pay-It-Forward Movement</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We're on a mission to make the world a better place while helping you feel up to{" "}
          <span className="font-semibold text-foreground">27× happier</span> by applying this simple brain hack.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Don't break the chain.</span> To get your FREE wristband,
          take 2 minutes and say <span className="text-primary font-semibold">"thank you"</span> to your best friend —
          tell them why you're grateful to have them in your life.
        </p>
      </motion.div>

      {/* Wristband reward teaser */}
      <motion.div
        className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <img
          src={wristbandImg}
          alt="FREE Wristband"
          className="w-14 h-14 rounded-lg object-cover border border-border/50"
        />
        <div>
          <p className="text-sm font-bold">🎁 Your FREE Wristband is Waiting</p>
          <p className="text-xs text-muted-foreground">Complete the 2-min gratitude exercise → claim it</p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          onClick={onContinue}
          className="w-full h-14 text-base md:text-lg font-bold btn-glow px-4"
        >
          Let's Do It — Takes 2 Minutes
          <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
        </Button>

        <button
          onClick={onSkip}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-3"
        >
          Skip for now
        </button>
      </motion.div>
    </motion.div>
  );
};

export default GratitudeIntroScreen;
