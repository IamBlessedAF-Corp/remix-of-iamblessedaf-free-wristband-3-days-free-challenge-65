import { useState } from "react";
import { useExitIntentTracking } from "@/hooks/useExitIntentTracking";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import GrokHeroSection from "@/components/offer/grok/GrokHeroSection";
import GrokValueStack from "@/components/offer/grok/GrokValueStack";
import SocialProofSection from "@/components/offer/SocialProofSection";
import GrokQuotesSection from "@/components/offer/grok/GrokQuotesSection";
import GrokCtaBlock from "@/components/offer/grok/GrokCtaBlock";
import GrokRiskReversal from "@/components/offer/grok/GrokRiskReversal";
import GrokViralFooter from "@/components/offer/grok/GrokViralFooter";
import { FriendShirtSection } from "@/components/offer/ProductSections";
import ProductSections from "@/components/offer/ProductSections";
import DiscountBanner from "@/components/offer/DiscountBanner";
import ResearchList from "@/components/offer/ResearchList";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import hawkinsScale from "@/assets/hawkins-scale.jpg";
import logo from "@/assets/logo.png";
import DownsellModal from "@/components/offer/DownsellModal";
import ShopifyStyleCart from "@/components/offer/ShopifyStyleCart";

const Offer111Grok = () => {
  const [showDownsell, setShowDownsell] = useState(false);
  const navigate = useNavigate();
  const { startCheckout, loading } = useStripeCheckout();
  const { track } = useExitIntentTracking("offer-111-grok");

  // Get friend name from localStorage (pre-loaded from challenge setup)
  const [friendName] = useState(() => {
    const shirtName = localStorage.getItem("friendShirtName") || "";
    if (shirtName) return shirtName;
    try {
      const setup = JSON.parse(localStorage.getItem("gratitude_challenge_setup") || "{}");
      return setup?.friends?.friend1 || "";
    } catch { return ""; }
  });

  const handleCheckout = () => {
    startCheckout("pack-111");
  };

  return (
    <div className="min-h-screen bg-background">
      <GamificationHeader />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">

          {/* ─── 1. Mystery Box Win Badge ─── */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold font-mono">
              <Lock className="w-4 h-4" />
              🎉 You Won a FREE Custom Shirt From the Mystery Box! 🎁
            </div>
          </motion.div>

          {/* ─── 2. Hero: Hook → Story → Aha! ─── */}
          <GrokHeroSection />

          {/* ─── Friend Shirt with Custom Message — storytelling intro ─── */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">
              Send Your Friend a Shirt With{" "}
              <span className="text-primary">Your Words on It</span> → They Read It → You Both Get Happier
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              When they read your message, their brain releases serotonin. When they text you back "thank you" — YOUR brain does the same. That's the 27× effect.
            </p>
          </motion.div>

          <FriendShirtSection delay={0.14} />

          {/* ─── 3. Value Stack: Benefits-First Bullets ─── */}
          <GrokValueStack />

          {/* Cart moved below 3rd CTA for consistency */}

          {/* ─── 4. CTA #1 (with scarcity) ─── */}
          <GrokCtaBlock
            onCheckout={handleCheckout}
            delay={0.35}
            showScarcity
            loading={loading}
          />

          {/* ─── 5. Social Proof: Testimonials + Live Metrics ─── */}
          <SocialProofSection variant="data" delay={0.3} />

          {/* ─── 6. Branding — "I AM" section ─── */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-1 leading-tight">
              Why <span className="text-primary">"I Am Blessed"</span> Works Better Than Any Affirmation
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
              Tony Robbins: "Whatever you attach to 'I am' with strong emotion — you become." When you wear "I Am Blessed AF," you're not describing a feeling. You're programming your brain to feel it. Every. Single. Day.
            </p>
          </motion.div>

          {/* ─── 7. Quotes: Short & Punchy ─── */}
          <GrokQuotesSection delay={0.45} />

          {/* ─── 8. Product Sections ─── */}
          <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4">
            WHAT'S IN YOUR PACK
          </p>
          <ProductSections
            afterWristband={
              <>
                <div className="text-center mb-6">
                  <DiscountBanner />
                </div>
                <GrokCtaBlock onCheckout={handleCheckout} delay={0.5} loading={loading} />
              </>
            }
          />

          {/* ─── 9. Science: Hawkins Scale ─── */}
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

          {/* ─── 10. Risk Reversal: Green Checkmarks ─── */}
          <GrokRiskReversal delay={0.7} />

          {/* ─── 11. CTA #3 ─── */}
          <GrokCtaBlock
            onCheckout={handleCheckout}
            delay={0.75}
            showScarcity
            loading={loading}
          />

          {/* ─── 12. Backed by Science ─── */}
          <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4 mt-4">
            The Science Is Clear
          </p>
          <ResearchList delay={0.8} />

          {/* ─── 13. CTA #4 (final) ─── */}
          <GrokCtaBlock onCheckout={handleCheckout} delay={0.85} loading={loading} />

          {/* ─── Shopify-style Cart — after 3rd CTA ─── */}
          <ShopifyStyleCart friendName={friendName} />

          {/* ─── 4th CTA after cart breakdown ─── */}
          <GrokCtaBlock onCheckout={handleCheckout} delay={0.9} loading={loading} />

          {/* ─── 14. Viral Footer + Skip ─── */}
          <GrokViralFooter
            delay={0.9}
            onSkip={(e) => { e.preventDefault(); setShowDownsell(true); }}
          />

          <DownsellModal
            open={showDownsell}
            onClose={() => setShowDownsell(false)}
            onAccept={() => { setShowDownsell(false); navigate("/offer/11mo"); }}
            onDecline={() => { setShowDownsell(false); navigate("/Congrats-Neuro-Hacker?next=/offer/444"); }}
            onTrack={track}
          />

        </div>
      </div>
    </div>
  );
};

export default Offer111Grok;
