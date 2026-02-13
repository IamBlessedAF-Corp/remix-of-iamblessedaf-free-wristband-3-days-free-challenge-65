import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Heart, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import { useAuth } from "@/hooks/useAuth";
import GratitudeEngineLoop from "@/components/offer/GratitudeEngineLoop";
import logo from "@/assets/logo.png";
import wristbandImg from "@/assets/wristband-gift.avif";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const handleClaim = () => {
    if (user) {
      navigate("/challenge");
    } else {
      setShowAuth(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GamificationHeader />
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-8">
        <motion.div
          className="text-center max-w-md space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <motion.img
            src={logo}
            alt="I am Blessed AF"
            className="w-full max-w-xs h-auto object-contain mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />

          {/* Hook headline — Hormozi style */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
              Feel Up to{" "}
              <motion.span
                className="text-primary inline-block"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
              >
                27× Happier
              </motion.span>{" "}
              in 3 Days
            </h1>
            <p className="text-base text-muted-foreground">
              No journals. No apps. No fluff. Just neuroscience.
            </p>
          </div>

          {/* The Wristband Visual + Explanation */}
          <motion.div
            className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border/50 text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.img
              src={wristbandImg}
              alt="FREE Gratitude Wristband"
              className="w-16 h-16 rounded-lg object-cover border border-border/50 flex-shrink-0"
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            />
            <div>
              <p className="text-sm font-bold text-foreground">🎁 Your FREE Neuro-Hacker Wristband</p>
              <p className="text-xs text-muted-foreground mt-1">
                A visual gratitude trigger on your wrist. Every time you see it, your brain fires
                the same neural pathways as feeling deeply grateful — <span className="text-primary font-semibold">without thinking about it.</span>
              </p>
            </div>
          </motion.div>

          {/* ═══ THE GRATITUDE ENGINE LOOP™ ═══ */}
          <GratitudeEngineLoop delay={0.35} />

          {/* The Movement — 3 days x 3 minutes */}
          <motion.div
            className="bg-accent/50 rounded-xl p-5 border border-primary/20 space-y-4 text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Heart className="w-5 h-5 text-primary flex-shrink-0" />
              </motion.div>
              <p className="text-sm font-bold text-foreground">You're Joining a Movement.</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              The <span className="font-bold text-foreground">Gratitude Pay-It-Forward Movement</span> is simple:
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">3 Days × 3 Minutes</p>
                  <p className="text-xs text-muted-foreground">
                    Say "thank you" to your 3 most loved ones. Tell them <span className="italic">why</span> they matter. That's it.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Get Them on the Same Wavelength</p>
                  <p className="text-xs text-muted-foreground">
                    When the people you love are in the same mindset of gratitude,
                    your relationships <span className="text-primary font-semibold">transform</span>. That's the neuro-hack.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">After 3 Days — Watch the Magic</p>
                  <p className="text-xs text-muted-foreground">
                    Your brain rewires. Your relationships deepen. You feel it in your chest.
                    That's not woo-woo — that's <span className="font-semibold text-foreground">Dr. Hawkins' Consciousness Scale</span>.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={handleClaim}
              className="w-full h-14 text-base md:text-lg font-bold btn-glow px-4"
            >
              <Sparkles className="w-5 h-5 mr-2 flex-shrink-0" />
              Claim My FREE Neuro-Hacker Wristband & Join
              <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
            </Button>

            <p className="text-xs text-muted-foreground mt-3">
              100% Free • Meals donated to Tony Robbins' "1 Billion Meals Challenge"
            </p>
          </motion.div>
        </motion.div>
      </div>
      <CreatorSignupModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false);
          navigate("/challenge");
        }}
      />
    </div>
  );
};

export default Index;
