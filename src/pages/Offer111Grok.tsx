import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import GrokHeroSection from "@/components/offer/grok/GrokHeroSection";
import GrokValueStack from "@/components/offer/grok/GrokValueStack";
import { TshirtProductSection } from "@/components/offer/ProductSections";
import GrokSocialProof from "@/components/offer/grok/GrokSocialProof";
import GrokQuotesSection from "@/components/offer/grok/GrokQuotesSection";
import GrokCtaBlock from "@/components/offer/grok/GrokCtaBlock";
import GrokRiskReversal from "@/components/offer/grok/GrokRiskReversal";
import GrokViralFooter from "@/components/offer/grok/GrokViralFooter";
import ProductSections from "@/components/offer/ProductSections";
import DiscountBanner from "@/components/offer/DiscountBanner";
import ResearchList from "@/components/offer/ResearchList";
import hawkinsScale from "@/assets/hawkins-scale.jpg";
import logo from "@/assets/logo.png";

const Offer111Grok = () => {
  const handleCheckout = () => {
    if (import.meta.env.DEV) {
      console.log("Redirecting to Stripe checkout for $111 pack (Grok variant)");
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
              Unlocked! You completed the 3-Day Challenge
            </div>
          </motion.div>

          {/* ─── 2. Hero: Benefit Headline + Epiphany Bridge ─── */}
          <GrokHeroSection />

          {/* ─── 3. Product: Main T-Shirt ─── */}
          <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4">
            GRATITUDE PACK
          </p>
          <TshirtProductSection delay={0.2} />

          {/* ─── 4. Value Stack: Benefits-First Bullets ─── */}
          <GrokValueStack />

          {/* ─── 4. CTA #1 (with scarcity) ─── */}
          <GrokCtaBlock
            onCheckout={handleCheckout}
            delay={0.35}
            showScarcity
          />

          {/* ─── 5. Social Proof: Testimonials + Metrics ─── */}
          <GrokSocialProof />

          {/* ─── 6. Branding — "I AM" section ─── */}
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
              Co-created with a PhD neuroscientist. 7+ years of research into conversation triggers that naturally evoke gratitude.
            </p>
          </motion.div>

          {/* ─── 7. Quotes: Short & Punchy ─── */}
          <GrokQuotesSection delay={0.45} />

          {/* ─── 8. Product Sections ─── */}
          <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4">
            GRATITUDE PACK
          </p>

          <ProductSections
            afterWristband={
              <>
                <div className="text-center mb-6">
                  <DiscountBanner />
                </div>
                <GrokCtaBlock onCheckout={handleCheckout} delay={0.5} />
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
          />

          {/* ─── 12. Backed by Science ─── */}
          <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4 mt-4">
            Backed by Science
          </p>
          <ResearchList delay={0.8} />

          {/* ─── 13. CTA #4 (final) ─── */}
          <GrokCtaBlock onCheckout={handleCheckout} delay={0.85} />

          {/* ─── 14. Viral Footer + Skip ─── */}
          <GrokViralFooter delay={0.9} />

        </div>
      </div>
    </div>
  );
};

export default Offer111Grok;
