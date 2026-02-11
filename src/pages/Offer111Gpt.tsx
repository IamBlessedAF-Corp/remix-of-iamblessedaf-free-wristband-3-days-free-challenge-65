import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { FriendShirtSection } from "@/components/offer/ProductSections";
import ProductSections from "@/components/offer/ProductSections";
import GptHeroSection from "@/components/offer/gpt/GptHeroSection";
import GptValueStack from "@/components/offer/gpt/GptValueStack";
import GptCtaBlock from "@/components/offer/gpt/GptCtaBlock";
import SocialProofSection from "@/components/offer/SocialProofSection";
import GptQuotesSection from "@/components/offer/gpt/GptQuotesSection";
import GptRiskReversal from "@/components/offer/gpt/GptRiskReversal";
import GptMessageModule from "@/components/offer/gpt/GptMessageModule";
import StickyCtaBar from "@/components/offer/StickyCtaBar";
import DiscountBanner from "@/components/offer/DiscountBanner";
import ResearchList from "@/components/offer/ResearchList";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import hawkinsScale from "@/assets/hawkins-scale.jpg";
import logo from "@/assets/logo.png";
import DownsellModal from "@/components/offer/DownsellModal";

const Offer111Gpt = () => {
  const [showDownsell, setShowDownsell] = useState(false);
  const navigate = useNavigate();
  const { startCheckout, loading } = useStripeCheckout();

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "upsell2_view" } }));
  }, []);

  const handleCheckout = () => {
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "upsell2_accept" } }));
    startCheckout("pack-111");
  };

  const handleDecline = () => {
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "upsell2_decline" } }));
    setShowDownsell(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <GamificationHeader />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">

          {/* ─── 1. Warm Badge ─── */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              ✅ Challenge Complete → Something Beautiful Awaits ✨
            </div>
          </motion.div>

          {/* ─── 2. Hero: Emotional Storytelling ─── */}
          <GptHeroSection />

          {/* ─── Friend Shirt — heart-centered intro ─── */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">
              Write Something That'll Make Them{" "}
              <span className="text-primary">Cry Happy Tears</span> 💛
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your words. Their shirt. Delivered to their door. When they read it, both your brains release the same happiness chemicals as a warm hug.
            </p>
          </motion.div>

          <FriendShirtSection delay={0.14} />

          {/* ─── 3. Value Stack: Emotion-First ─── */}
          <GptValueStack />

          {/* ─── 4. CTA #1 (warm scarcity) ─── */}
          <GptCtaBlock
            onCheckout={handleCheckout}
            delay={0.35}
            showScarcity
            loading={loading}
          />

          {/* ─── 5. Social Proof: Emotional Stories + Live Metrics ─── */}
          <SocialProofSection variant="story" delay={0.3} />

          {/* ─── 6. Branding — "I AM" (warm) ─── */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-1 leading-tight">
              The Most Powerful Words You'll Ever Say Start With{" "}
              <span className="text-primary">"I Am"</span>
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
              Tony Robbins says: "Whatever you attach to 'I am' — you become." When you wear "I Am Blessed AF," you're not just wearing a shirt. You're telling your brain who you are. And your brain listens.
            </p>
          </motion.div>

          {/* ─── 7. Quotes: Inspirational ─── */}
          <GptQuotesSection delay={0.45} />

          {/* ─── 8. Product Sections ─── */}
          <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4">
            YOUR GRATITUDE PACK ✨
          </p>
          <ProductSections
            afterWristband={
              <>
                <div className="text-center mb-6">
                  <DiscountBanner />
                </div>
                <GptCtaBlock onCheckout={handleCheckout} delay={0.5} loading={loading} />
              </>
            }
          />

          {/* ─── 9. Science: Hawkins Scale (warm framing) ─── */}
          <motion.div
            className="text-center mt-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-xl md:text-2xl font-bold text-foreground mb-2 max-w-lg mx-auto">
              Your Brain on Gratitude:{" "}
              <span className="text-primary">From Struggle to Joy</span>
            </p>
            <p className="text-base text-muted-foreground mb-4 max-w-lg mx-auto">
              Dr. Hawkins discovered that emotions have frequencies.{" "}
              <span className="font-bold text-foreground">Shame vibrates at 20 Hz</span>.{" "}
              <span className="font-bold text-foreground">Joy vibrates at 540 Hz</span>.
              Gratitude is the bridge between them — and you can walk across it any time.
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

          {/* ─── 10. Risk Reversal: Warm Promise ─── */}
          <GptRiskReversal delay={0.7} />

          {/* ─── 11. CTA #3 ─── */}
          <GptCtaBlock
            onCheckout={handleCheckout}
            delay={0.75}
            showScarcity
            loading={loading}
          />

          {/* ─── 12. Backed by Science (warm) ─── */}
          <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4 mt-4">
            The Science Behind the Feeling ✨
          </p>
          <ResearchList delay={0.8} />

          {/* ─── 13. CTA #4 (final) ─── */}
          <GptCtaBlock onCheckout={handleCheckout} delay={0.85} loading={loading} />

          {/* ─── 14. Decline link ─── */}
          <motion.div
            className="text-center mt-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <button
              onClick={handleDecline}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later? → (We'll send a gentle reminder)
            </button>
          </motion.div>

          <DownsellModal
            open={showDownsell}
            onClose={() => setShowDownsell(false)}
            onAccept={() => { setShowDownsell(false); navigate("/offer/11mo"); }}
            onDecline={() => { setShowDownsell(false); navigate("/offer/444"); }}
          />

        </div>
      </div>

      {/* ─── Sticky Bottom Bar ─── */}
      <StickyCtaBar
        onCheckout={handleCheckout}
        loading={loading}
        price="$111"
        discount="67% OFF"
        label="Add to My Order"
        trackingSource="offer_111_gpt"
      />
    </div>
  );
};

export default Offer111Gpt;
