import { motion } from "framer-motion";
import { Crown, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResearchList from "@/components/offer/ResearchList";
import hawkinsScale from "@/assets/hawkins-scale.jpg";
import GratitudeIntro from "@/components/offer/GratitudeIntro";
import DiscountBanner from "@/components/offer/DiscountBanner";
import ProductSections from "@/components/offer/ProductSections";
import logo from "@/assets/logo.png";
import RiskReversalGuarantee from "@/components/offer/RiskReversalGuarantee";

const Offer111 = () => {
  const handleCheckout = () => {
    // Placeholder for Stripe checkout
    if (import.meta.env.DEV) {
      console.log("Redirecting to Stripe checkout for $111 pack");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Unlock Badge */}
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

          {/* Gratitude Intro Section */}
          <GratitudeIntro />

          {/* Logo + Gratitude Pack + Discount — unified block */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="overflow-hidden -my-6">
              <img
                src={logo}
                alt="I am Blessed AF"
                className="w-full max-w-sm h-auto object-contain mx-auto"
              />
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-4 leading-relaxed">
              IamBlessedAF is the result of 7+ years of research and experimentation, Co-created alongside a PhD neuroscientist and focused on designing conversation triggers that naturally evoke gratitude.
            </p>
          </motion.div>

          {/* CTA before products */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4">
              77% OFF TODAY
            </p>
            <Button
              onClick={handleCheckout}
              className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
            >
              <Crown className="w-5 h-5 mr-2" />
              Claim Your Gratitude Pack
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              🔒 Secure checkout • FREE Shipping
            </p>
            <RiskReversalGuarantee />
          </motion.div>

          {/* Product Sections */}
          <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4">
            GRATITUDE PACK
          </p>

          <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-6 shadow-soft">
            <p className="text-sm md:text-base italic text-foreground leading-relaxed">
              "Whatever you consistently attach to 'I am' with strong emotion and repetition—such as 'I am bold'—you will eventually become. Unlike saying 'I'm going to be bold.'"
            </p>
            <footer className="mt-3 text-xs md:text-sm text-muted-foreground font-semibold">
              — Tony Robbins
            </footer>
          </blockquote>

          <ProductSections
            afterWristband={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="text-center mb-6">
                  <DiscountBanner />
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Claim Your Gratitude Pack — $111
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  🔒 Secure checkout • FREE Shipping
                </p>
                <RiskReversalGuarantee />
              </motion.div>
            }
          />

          {/* Science Section — moved below CTA */}
          <motion.div
            className="text-center mt-12 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            {/* Huberman Quote */}
            <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-6 shadow-soft">
              <p className="text-sm md:text-base italic text-foreground leading-relaxed">
                "Gratitude isn't created by affirmations, it's activated by receiving genuine appreciation."
              </p>
              <footer className="mt-3 text-xs md:text-sm text-muted-foreground font-semibold">
                — Andrew Huberman, Neuroscientist
              </footer>
            </blockquote>

            <p className="text-base md:text-lg text-muted-foreground mb-2 max-w-lg mx-auto">
              Dr. Hawkins — PhD Psychiatrist Research illustrated by this emotional scale, the frequency of{" "}
              <span className="font-bold text-foreground">shame is 20 Hz</span> and{" "}
              <span className="font-bold text-foreground">Joy is 540 Hz</span>.
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-2 max-w-lg mx-auto">
              Gratitude makes you feel the emotion of <span className="font-bold text-foreground">Joy</span>.
            </p>
            <p className="text-xl md:text-2xl font-bold text-primary mb-6 max-w-lg mx-auto">
              Hack your Brain to feel up 27x HAPPIER
            </p>

            {/* Hawkins Emotional Guidance Scale */}
            <motion.div
              className="max-w-lg mx-auto mb-6 rounded-2xl overflow-hidden border border-border/50 shadow-soft"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <img
                src={hawkinsScale}
                alt="Dr. Hawkins Emotional Guidance Scale"
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </motion.div>

          </motion.div>

          {/* Discount + Second CTA */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <div className="text-center mb-6">
              <DiscountBanner />
            </div>
          </motion.div>

          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.45 }}
          >
            <Button
              onClick={handleCheckout}
              className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
            >
              <Crown className="w-5 h-5 mr-2" />
              Claim Your Gratitude Pack — $111
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              🔒 Secure checkout • FREE Shipping
            </p>
            <RiskReversalGuarantee />
          </motion.div>

          {/* Research List */}
          <ResearchList delay={1.5} />

          {/* CTA after research */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <Button
              onClick={handleCheckout}
              className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
            >
              <Crown className="w-5 h-5 mr-2" />
              Claim Your Gratitude Pack — $111
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              🔒 Secure checkout • FREE Shipping
            </p>
            <RiskReversalGuarantee />
          </motion.div>

          {/* Trust Disclaimer */}
          <motion.div
            className="mb-8 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.65 }}
          >
            <div className="border border-border/50 rounded-xl p-5 space-y-3 bg-card">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
                <span>✅</span>
                <span>30-Day Money-Back Guarantee — No questions asked</span>
              </div>
              <div className="h-px bg-border/40" />
              <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground text-center">
                <p>🔒 256-bit SSL Encrypted · Secure Payment · Your data is never shared</p>
                <p>📦 100% Satisfaction Guaranteed · Free Intl Shipping · 7–14 day delivery</p>
                <p>💳 One-time payment. No subscriptions. No hidden fees.</p>
              </div>
            </div>
          </motion.div>

          {/* Skip Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
          >
            <a
              href="/challenge/thanks"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later →
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Offer111;
