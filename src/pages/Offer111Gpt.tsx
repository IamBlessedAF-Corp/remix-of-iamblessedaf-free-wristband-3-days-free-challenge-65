import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Crown, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendShirtSection } from "@/components/offer/ProductSections";
import ProductSections from "@/components/offer/ProductSections";
import GptMessageModule from "@/components/offer/gpt/GptMessageModule";
import GptStickyBar from "@/components/offer/gpt/GptStickyBar";
import GptViralShare from "@/components/offer/gpt/GptViralShare";
import OfferTimer from "@/components/offer/OfferTimer";
import AuthorAvatar from "@/components/offer/AuthorAvatar";
import ResearchList from "@/components/offer/ResearchList";
import hawkinsScale from "@/assets/hawkins-scale.jpg";
import logo from "@/assets/logo.png";

const Offer111Gpt = () => {
  const [purchased, setPurchased] = useState(false);

  // Track page view
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "upsell2_view" } }));
  }, []);

  const handleCheckout = () => {
    if (import.meta.env.DEV) {
      console.log("1-click add to order: $111 Gratitude Pack (GPT variant)");
    }
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "upsell2_accept" } }));
    setPurchased(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDecline = () => {
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "upsell2_decline" } }));
    window.location.href = "/challenge/thanks";
  };

  // ─── Post-purchase: Viral Share Module ───
  if (purchased) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-2xl mx-auto">
            <GptViralShare />

            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <a
                href="/challenge/thanks"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Continue to dashboard →
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Offer Page ───
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">

          {/* ═══ ATTENTION: Unlock Badge ═══ */}
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              <Lock className="w-4 h-4" />
              Unlocked! You completed the 3-Day Challenge
            </div>
          </motion.div>

          {/* ═══ ATTENTION: Headline ═══ */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3 leading-tight">
              You Unlocked Something{" "}
              <span className="text-primary">Special</span> 🎁
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Because you finished the challenge, this one-time Gratitude Pack is yours — at the lowest price we'll ever offer.
            </p>
          </motion.div>

          {/* ═══ INTEREST: Epiphany Bridge (3-5 lines) ═══ */}
          <motion.div
            className="bg-card border border-border/50 rounded-xl p-5 max-w-lg mx-auto mb-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-sm md:text-base text-foreground leading-relaxed">
              Research suggests the most potent form of gratitude isn't <em>giving</em> thanks — it's{" "}
              <strong className="text-primary">receiving genuine appreciation</strong>.
            </p>
            <p className="text-sm md:text-base text-foreground leading-relaxed mt-2">
              That's what this pack creates: a real moment where your best friend reads{" "}
              <strong>YOUR words</strong> on a custom shirt and <em>feels</em> it. That's the brain rewire. That's the dopamine hit. And <strong>you</strong> triggered it.
            </p>
          </motion.div>

          {/* ═══ Friend Shirt + Custom Message Module ═══ */}
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <p className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              Write a message to your{" "}
              <span className="text-primary">Best Friend</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              We'll print it on a custom shirt and send it to them — for free.
            </p>
          </motion.div>

          <FriendShirtSection delay={0.18} afterHeroSlot={<GptMessageModule />} />

          {/* ═══ DESIRE: What You Get (compact visual stack) ═══ */}
          <motion.div
            className="max-w-lg mx-auto mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-center text-xl md:text-2xl font-bold text-foreground mb-4">
              Your Gratitude Pack
            </p>

            <div className="space-y-2">
              {[
                {
                  emoji: "👕",
                  title: "Your \"IamBlessedAF\" Streetwear T-Shirt",
                  sub: "Premium cotton · Double-sided print · S–3XL",
                },
                {
                  emoji: "🎁",
                  title: "FREE Custom Shirt for Your Best Friend",
                  sub: "Your personal message printed · One-side print",
                  highlight: true,
                },
                {
                  emoji: "📿",
                  title: "3 Trigger Reminder Wristbands",
                  sub: "NFC-enabled · Waterproof silicone",
                },
                {
                  emoji: "❤️",
                  title: "11 Meals Donated via Feeding America",
                  sub: "Instant impact — even on your worst days",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    item.highlight
                      ? "bg-primary/5 border border-primary/20"
                      : ""
                  }`}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>

            {/* Price anchor */}
            <div className="text-center mt-4 mb-2">
              <div className="inline-flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground">$111</span>
                <span className="text-lg text-muted-foreground line-through">$333</span>
                <span className="text-sm font-bold text-primary">67% OFF</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                🇺🇸 Free US Shipping · International $14.95 Flat
              </p>
            </div>
          </motion.div>

          {/* ═══ Urgency: Timer ═══ */}
          <motion.div
            className="mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-3 text-center max-w-lg mx-auto">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                ⚡ Reserved at this price after your challenge completion
              </p>
            </div>
            <OfferTimer />
          </motion.div>

          {/* ═══ ACTION: Primary CTA ═══ */}
          <motion.div
            className="max-w-lg mx-auto mb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleCheckout}
              className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
            >
              <Crown className="w-5 h-5 mr-2" />
              YES — Feed 11 People & Get My Pack!
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-2">
              One-time secure payment · 1-click — no re-entering card details
            </p>
          </motion.div>

          {/* ═══ Guarantee (single, compact) ═══ */}
          <motion.div
            className="max-w-lg mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
          >
            <div className="border border-border/50 rounded-xl p-4 bg-card">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground mb-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                30-Day Happiness Guarantee
              </div>
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Use the pack for 3 days. If you don't feel happier after receiving responses from your loved ones — full refund, no questions asked. Keep the donated meals.
              </p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                <span>✅ 256-bit SSL Encrypted</span>
                <span>✅ No subscriptions</span>
                <span>✅ Free US Shipping</span>
              </div>
            </div>
          </motion.div>

          {/* ═══ TRUST: Compact Quotes (2 only) ═══ */}
          <motion.div
            className="space-y-4 max-w-lg mx-auto mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <p className="text-center text-lg font-bold text-foreground">
              Backed by Science
            </p>

            <blockquote className="bg-card border border-border/50 rounded-xl p-4">
              <p className="text-sm italic text-foreground leading-relaxed">
                "It turns out that the most potent form of gratitude practice is not a gratitude practice where you give gratitude or express gratitude, but rather where you <strong>receive</strong> gratitude, where you receive thanks."
              </p>
              <footer className="mt-3">
                <AuthorAvatar author="huberman" />
              </footer>
            </blockquote>

            <blockquote className="bg-card border border-border/50 rounded-xl p-4">
              <p className="text-sm italic text-foreground leading-relaxed">
                "Whatever you consistently attach to 'I am' with strong emotion and repetition — such as 'I am bold' — you will eventually become."
              </p>
              <footer className="mt-3">
                <AuthorAvatar author="tony-robbins" />
              </footer>
            </blockquote>
          </motion.div>

          {/* ═══ Branding: I AM ═══ */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
          >
            <p className="text-xl md:text-2xl font-bold text-foreground mb-1 leading-tight">
              This is why <span className="text-primary">IamBlessedAF</span> starts with
            </p>
            <p className="text-3xl md:text-4xl font-black text-primary mb-1">
              "I AM"
            </p>
            <div className="overflow-hidden -my-4">
              <img
                src={logo}
                alt="I am Blessed AF"
                className="w-full max-w-sm h-auto object-contain mx-auto"
              />
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-0">
              Co-created with a PhD neuroscientist. 7+ years of research into conversation triggers that naturally evoke gratitude.
            </p>
          </motion.div>

          {/* ═══ Hawkins Scale (compact) ═══ */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-lg font-bold text-foreground mb-1 max-w-md mx-auto">
              Research suggests gratitude can shift your emotional frequency up to{" "}
              <span className="text-primary">27x higher</span>
            </p>
            <p className="text-xs text-muted-foreground mb-3 max-w-md mx-auto">
              From shame (20 Hz) to joy (540 Hz) on Dr. Hawkins' scale.
            </p>
            <div className="max-w-md mx-auto rounded-xl overflow-hidden border border-border/50">
              <img
                src={hawkinsScale}
                alt="Dr. Hawkins Emotional Guidance Scale"
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* ═══ Research List (collapsible) ═══ */}
          <ResearchList delay={0.42} />

          {/* ═══ Final CTA ═══ */}
          <motion.div
            className="max-w-lg mx-auto mt-6 mb-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <OfferTimer />
            <div className="h-3" />
            <Button
              onClick={handleCheckout}
              className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
            >
              <Crown className="w-5 h-5 mr-2" />
              YES — Feed 11 People & Get My Pack!
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-2">
              One-time secure payment · 1-click — no re-entering card details
            </p>
          </motion.div>

          {/* ═══ Decline link ═══ */}
          <motion.div
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleDecline}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              No thanks, I'll skip this offer →
            </button>
          </motion.div>

        </div>
      </div>

      {/* ═══ Sticky Bottom Bar ═══ */}
      <GptStickyBar onCheckout={handleCheckout} />
    </div>
  );
};

export default Offer111Gpt;
