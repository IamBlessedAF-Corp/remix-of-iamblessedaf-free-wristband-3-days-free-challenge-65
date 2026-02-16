import { useState } from "react";
import { useExitIntent } from "@/hooks/useExitIntent";
import { useExitIntentTracking } from "@/hooks/useExitIntentTracking";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Grok1111HeroSection from "@/components/offer/grok/Grok1111HeroSection";
import Grok1111ValueStack from "@/components/offer/grok/Grok1111ValueStack";
import Grok1111CtaBlock from "@/components/offer/grok/Grok1111CtaBlock";
import SocialProofSection from "@/components/offer/SocialProofSection";
import GrokQuotesSection from "@/components/offer/grok/GrokQuotesSection";
import GrokRiskReversal from "@/components/offer/grok/GrokRiskReversal";
import GrokViralFooter from "@/components/offer/grok/GrokViralFooter";
import { FriendShirtSection } from "@/components/offer/ProductSections";
import ProductSections from "@/components/offer/ProductSections";
import ResearchList from "@/components/offer/ResearchList";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import hawkinsScale from "@/assets/hawkins-scale.jpg";
import logo from "@/assets/logo.png";
import StickyCtaBar from "@/components/offer/StickyCtaBar";
import EpiphanyBridge from "@/components/offer/EpiphanyBridge";
import ImpactCounter from "@/components/offer/ImpactCounter";
import ViralShareNudge from "@/components/offer/ViralShareNudge";
import DownsellModal from "@/components/offer/DownsellModal";

const Offer1111 = () => {
  const [showDownsell, setShowDownsell] = useState(false);
  const navigate = useNavigate();
  const { startCheckout, loading } = useStripeCheckout();
  const { track } = useExitIntentTracking("offer-1111");
  useExitIntent(() => {
    if (!showDownsell) setShowDownsell(true);
  }, { sessionKey: "offer-1111" });

  const handleCheckout = () => {
    startCheckout("pack-1111");
  };

  return (
    <div className="min-h-screen bg-background">
      <GamificationHeader />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
            <>
              {/* ─── 1. Unlock Badge ─── */}
              <motion.div className="text-center mb-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                  <Lock className="w-4 h-4" />
                  You earned this → Become a Kingdom Ambassador
                </div>
              </motion.div>

              <Grok1111HeroSection />

              {/* Epiphany Bridge — Brunson storytelling */}
              <EpiphanyBridge />

              <motion.div className="text-center mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}>
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">
                  Imagine 11 People Opening Custom Shirts with Messages from <span className="text-primary">You</span>
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Parents. Siblings. Best friends. Mentors. Each text back triggers your 27× dopamine hit — 11 times over.
                </p>
              </motion.div>

              <FriendShirtSection delay={0.14} />
              <Grok1111ValueStack />

              <Grok1111CtaBlock onCheckout={handleCheckout} delay={0.35} showScarcity loading={loading} />
              <SocialProofSection variant="data" delay={0.35} />

              <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-1 leading-tight">
                  This is why <span className="text-primary">IamBlessedAF</span> starts with the most powerful words
                </p>
                <p className="text-4xl md:text-5xl font-black text-primary mb-2">"I AM"</p>
                <div className="overflow-hidden -my-6">
                  <img src={logo} alt="I am Blessed AF" className="w-full max-w-sm h-auto object-contain mx-auto" />
                </div>
                <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-4 leading-relaxed">
                  7 shirts. Every day of the week. 11 people wearing your message. 111 wristbands in the wild.{" "}
                  <span className="font-bold text-foreground">You're not buying merch — you're answering the call: "Go & make disciples of all nations."</span>
                </p>
              </motion.div>

              <GrokQuotesSection delay={0.45} />

              <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4">KINGDOM AMBASSADOR PACK</p>

              <motion.div className="bg-card border border-border/50 rounded-xl p-4 mb-4 max-w-lg mx-auto shadow-soft" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">🖤</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">7× Black IamBlessedAF Shirts</p>
                      <p className="text-xs text-muted-foreground">One for every day of the week — never break the chain</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">🤍</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">11× White Custom Friend Shirts</p>
                      <p className="text-xs text-muted-foreground">Your unique message for 11 people who shaped your life</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">📿</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">111× Gratitude Trigger Wristbands</p>
                      <p className="text-xs text-muted-foreground">Give away everywhere — turn your whole circle into a gratitude network</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <ProductSections
                afterWristband={
                  <Grok1111CtaBlock onCheckout={handleCheckout} delay={0.5} loading={loading} />
                }
              />

              <motion.div className="text-center mt-4 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
                <p className="text-xl md:text-2xl font-bold text-foreground mb-2 max-w-lg mx-auto">
                  Hack your Brain to feel up to <span className="text-primary">27x HAPPIER</span>
                </p>
                <p className="text-base text-muted-foreground mb-4 max-w-lg mx-auto">
                  Dr. Hawkins' research shows the frequency of{" "}
                  <span className="font-bold text-foreground">shame is 20 Hz</span> and{" "}
                  <span className="font-bold text-foreground">Joy is 540 Hz</span>.
                  Gratitude makes you feel <span className="font-bold text-foreground">Joy</span>.
                </p>
                <motion.div className="max-w-lg mx-auto mb-6 rounded-2xl overflow-hidden border border-border/50 shadow-soft" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.65 }}>
                  <img src={hawkinsScale} alt="Dr. Hawkins Emotional Guidance Scale" className="w-full h-auto object-contain" loading="lazy" />
                </motion.div>
              </motion.div>

              <GrokRiskReversal delay={0.7} />
              <Grok1111CtaBlock onCheckout={handleCheckout} delay={0.75} showScarcity loading={loading} />

              <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4 mt-4">Backed by Science</p>
              <ResearchList delay={0.8} />

              <Grok1111CtaBlock onCheckout={handleCheckout} delay={0.85} loading={loading} />

              {/* Live Impact Counter */}
              <ImpactCounter />

              {/* Viral Share Nudge */}
              <ViralShareNudge />

              <GrokViralFooter
                delay={0.9}
                skipUrl="/offer/4444"
                onSkip={(e) => { e.preventDefault(); setShowDownsell(true); }}
              />

               <DownsellModal
                open={showDownsell}
                onClose={() => setShowDownsell(false)}
                onAccept={() => { setShowDownsell(false); navigate("/offer/11mo"); }}
                onDecline={() => { setShowDownsell(false); navigate("/Congrats-Neuro-Hacker"); }}
                onTrack={track}
              />
             </>
        </div>
      </div>
      <StickyCtaBar
        onCheckout={handleCheckout}
        loading={loading}
        price="$1,111"
        discount="Save $2,220"
        label="YES! Become a Kingdom Ambassador 👑"
        trackingSource="offer_1111"
        triggerSelector="[data-price-anchor]"
      />
    </div>
  );
};

export default Offer1111;
