import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Heart, Users, Zap, FlaskConical, ChevronDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import { useAuth } from "@/hooks/useAuth";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
              <p className="text-sm font-bold text-foreground">🎁 Your FREE Neuro-Hack Wristband</p>
              <p className="text-xs text-muted-foreground mt-1">
                A visual gratitude trigger on your wrist. Every time you see it, your brain fires
                the same neural pathways as feeling deeply grateful — <span className="text-primary font-semibold">without thinking about it.</span>
              </p>
            </div>
          </motion.div>

          {/* ═══ THE GRATITUDE ENGINE LOOP™ ═══ */}
          <motion.div
            className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/5 overflow-hidden p-6 text-center space-y-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
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
              Claim My FREE Wristband & Join
              <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
            </Button>

            <p className="text-xs text-muted-foreground mt-3">
              100% Free • 22 meals donated with every order
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
