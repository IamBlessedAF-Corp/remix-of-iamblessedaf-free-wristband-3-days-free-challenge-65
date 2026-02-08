import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Grok4444HeroSection from "@/components/offer/grok/Grok4444HeroSection";
import Grok4444ValueStack from "@/components/offer/grok/Grok4444ValueStack";
import Grok4444CtaBlock from "@/components/offer/grok/Grok4444CtaBlock";
import SocialProofSection from "@/components/offer/SocialProofSection";
import GrokQuotesSection from "@/components/offer/grok/GrokQuotesSection";
import GrokRiskReversal from "@/components/offer/grok/GrokRiskReversal";
import GrokViralFooter from "@/components/offer/grok/GrokViralFooter";
import ResearchList from "@/components/offer/ResearchList";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import { useGamificationStats } from "@/hooks/useGamificationStats";
import hawkinsScale from "@/assets/hawkins-scale.jpg";
import logo from "@/assets/logo.png";

const Offer4444 = () => {
  const { rewardCheckout } = useGamificationStats();

  const handleCheckout = () => {
    rewardCheckout("pack-4444");
    if (import.meta.env.DEV) {
      console.log("Redirecting to Stripe checkout for $4,444 Patron Pack");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GamificationHeader />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">

          {/* ─── 1. Unlock Badge ─── */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              <Lock className="w-4 h-4" />
              Legacy tier → Fund an artist & own your gratitude story
            </div>
          </motion.div>

          {/* ─── 2. Hero: Benefit Headline + Epiphany Bridge ─── */}
          <Grok4444HeroSection />

          {/* ─── 3. Value Stack ─── */}
          <Grok4444ValueStack />

          {/* ─── 4. CTA #1 (with scarcity) ─── */}
          <Grok4444CtaBlock
            onCheckout={handleCheckout}
            delay={0.35}
            showScarcity
          />

          {/* ─── 5. Social Proof — Live Metrics ─── */}
          <SocialProofSection variant="data" delay={0.35} />

          {/* ─── 6. What You Get Breakdown ─── */}
          <motion.div
            className="bg-card border border-border/50 rounded-xl p-5 mb-8 max-w-lg mx-auto shadow-soft"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-lg font-bold text-foreground mb-4 text-center">
              Here's Exactly What Happens After You Click
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center font-bold text-primary">1</span>
                <div>
                  <p className="text-sm font-bold text-foreground">Choose Your Artist</p>
                  <p className="text-xs text-muted-foreground">Pick any artist you want to support — they receive 77% ($3,422) directly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center font-bold text-primary">2</span>
                <div>
                  <p className="text-sm font-bold text-foreground">Artist Creates 3 Custom Pieces</p>
                  <p className="text-xs text-muted-foreground">Gratitude-themed originals for the IamBlessedAF brand — you get 1 of each</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center font-bold text-primary">3</span>
                <div>
                  <p className="text-sm font-bold text-foreground">Custom Leather Jacket Ships</p>
                  <p className="text-xs text-muted-foreground">Handcrafted with IamBlessedAF detailing — your size, your style</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center font-bold text-primary">4</span>
                <div>
                  <p className="text-sm font-bold text-foreground">NFTs Minted & Transferred</p>
                  <p className="text-xs text-muted-foreground">On-chain ownership of every art piece — yours forever</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0 bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center font-bold text-primary">5</span>
                <div>
                  <p className="text-sm font-bold text-foreground">Gratitude Storyboard Canvas</p>
                  <p className="text-xs text-muted-foreground">Your personal story transformed into gallery-quality canvas art</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── 7. Branding — "I AM" section ─── */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-1 leading-tight">
              This is why <span className="text-primary">IamBlessedAF</span> starts with the most powerful words
            </p>
            <p className="text-4xl md:text-5xl font-black text-primary mb-2">
              "I AM"
            </p>
            <div className="overflow-hidden -my-6">
              <img
                src={logo}
                alt="I am Blessed AF"
                className="w-full max-w-sm h-auto object-contain mx-auto"
              />
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-4 leading-relaxed">
              Art. Identity. Legacy. You're not buying products — you're{" "}
              <span className="font-bold text-foreground">funding an artist, owning the art, and feeding 44,444 people.</span>
            </p>
          </motion.div>

          {/* ─── 8. Quotes ─── */}
          <GrokQuotesSection delay={0.45} />

          {/* ─── 9. Artist Support Highlight ─── */}
          <motion.div
            className="bg-card border-2 border-primary/30 rounded-2xl p-5 mb-8 max-w-lg mx-auto shadow-soft"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-center text-xl font-bold text-foreground mb-3">
              🎨 77% Goes Directly to Your Artist
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your payment</span>
                <span className="font-bold text-foreground">$4,444</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Artist receives (77%)</span>
                <span className="font-bold text-primary">$3,422</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Materials + NFT minting + shipping</span>
                <span className="font-bold text-foreground">$1,022</span>
              </div>
              <div className="border-t border-border/50 pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Meals donated</span>
                  <span className="font-bold text-primary">44,444 🍽️</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── 10. CTA #2 ─── */}
          <Grok4444CtaBlock onCheckout={handleCheckout} delay={0.55} />

          {/* ─── 11. Science: Hawkins Scale ─── */}
          <motion.div
            className="text-center mt-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-xl md:text-2xl font-bold text-foreground mb-2 max-w-lg mx-auto">
              Hack your Brain to feel up to{" "}
              <span className="text-primary">27x HAPPIER</span>
            </p>
            <p className="text-base text-muted-foreground mb-4 max-w-lg mx-auto">
              Dr. Hawkins' research shows the frequency of{" "}
              <span className="font-bold text-foreground">shame is 20 Hz</span> and{" "}
              <span className="font-bold text-foreground">Joy is 540 Hz</span>.
              Gratitude makes you feel <span className="font-bold text-foreground">Joy</span>.
            </p>

            <motion.div
              className="max-w-lg mx-auto mb-6 rounded-2xl overflow-hidden border border-border/50 shadow-soft"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.65 }}
            >
              <img
                src={hawkinsScale}
                alt="Dr. Hawkins Emotional Guidance Scale"
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </motion.div>
          </motion.div>

          {/* ─── 12. Risk Reversal ─── */}
          <GrokRiskReversal delay={0.7} />

          {/* ─── 13. CTA #3 ─── */}
          <Grok4444CtaBlock
            onCheckout={handleCheckout}
            delay={0.75}
            showScarcity
          />

          {/* ─── 14. Backed by Science ─── */}
          <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4 mt-4">
            Backed by Science
          </p>
          <ResearchList delay={0.8} />

          {/* ─── 15. CTA #4 (final) ─── */}
          <Grok4444CtaBlock onCheckout={handleCheckout} delay={0.85} />

          {/* ─── 16. Viral Footer + Skip ─── */}
          <GrokViralFooter delay={0.9} />

        </div>
      </div>
    </div>
  );
};

export default Offer4444;
