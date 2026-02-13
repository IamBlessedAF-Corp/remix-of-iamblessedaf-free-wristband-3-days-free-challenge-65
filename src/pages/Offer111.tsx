import { useState, useEffect } from "react";
import { useExitIntent } from "@/hooks/useExitIntent";
import { useExitIntentTracking } from "@/hooks/useExitIntentTracking";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResearchList from "@/components/offer/ResearchList";
import hawkinsScale from "@/assets/hawkins-scale.jpg";
import GratitudeIntro from "@/components/offer/GratitudeIntro";
import DiscountBanner from "@/components/offer/DiscountBanner";
import ProductSections from "@/components/offer/ProductSections";
import logo from "@/assets/logo.png";
import RiskReversalGuarantee from "@/components/offer/RiskReversalGuarantee";
import OfferTimer from "@/components/offer/OfferTimer";
import AuthorAvatar from "@/components/offer/AuthorAvatar";
import UrgencyBanner from "@/components/offer/UrgencyBanner";
import SocialProofSection from "@/components/offer/SocialProofSection";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import EpiphanyBridge from "@/components/offer/EpiphanyBridge";
import ImpactCounter from "@/components/offer/ImpactCounter";
import ViralShareNudge from "@/components/offer/ViralShareNudge";
import CrossFunnelShareNudge from "@/components/viral/CrossFunnelShareNudge";
import AchievementUnlockToast from "@/components/gamification/AchievementUnlockToast";
import { useAchievements } from "@/hooks/useAchievements";
import DownsellModal from "@/components/offer/DownsellModal";
import { supabase } from "@/integrations/supabase/client";

const Offer111 = () => {
  const [showDownsell, setShowDownsell] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startCheckout, loading } = useStripeCheckout();
  const { track } = useExitIntentTracking("offer-111");
  const { newlyUnlocked, dismissNewlyUnlocked } = useAchievements();

  // Exit-intent: trigger downsell when user tries to leave
  useExitIntent(() => setShowDownsell(true), {
    enabled: !showDownsell,
    sessionKey: "offer-111",
    delayMs: 8000,
  });
  const urlFriend = searchParams.get("friend") || "";
  const [friendName, setFriendName] = useState(() => {
    const stored = localStorage.getItem("friendShirtName") || "";
    const name = stored || urlFriend;
    if (urlFriend && !stored) localStorage.setItem("friendShirtName", urlFriend);
    return name;
  });

  // Also look up sender name from referral code (like Offer22 does)
  const [senderName, setSenderName] = useState("");
  useEffect(() => {
    const refCode = sessionStorage.getItem("referral_code") || searchParams.get("ref") || "";
    if (!refCode) return;
    supabase
      .from("creator_profiles_public")
      .select("display_name")
      .eq("referral_code", refCode)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setSenderName(data.display_name.split(" ")[0]);
      });
  }, [searchParams]);

  // Listen for localStorage changes from ProductSections/ShirtCustomizer
  useEffect(() => {
    const check = () => {
      const stored = localStorage.getItem("friendShirtName") || "";
      if (stored && stored !== friendName) setFriendName(stored);
    };
    window.addEventListener("storage", check);
    const interval = setInterval(check, 1000);
    return () => { window.removeEventListener("storage", check); clearInterval(interval); };
  }, [friendName]);

  const hasFriendParam = Boolean(urlFriend);

  const handleCheckout = () => {
    startCheckout("pack-111");
  };

  return (
    <div className="min-h-screen bg-background">
      <GamificationHeader />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
            <>
              {/* Unlock Badge */}
              <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                  <Crown className="w-4 h-4" />
                  🎉 Congratulations! You Won a FREE Custom Shirt! 🎁
                </div>
              </motion.div>

              {/* Friend waiting banner */}
              {hasFriendParam && friendName && (
                <motion.div
                  className="mb-6 bg-primary/10 border border-primary/30 rounded-2xl p-4 text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <motion.p
                    className="text-base md:text-lg font-bold text-primary"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    👕 {friendName} is waiting for their shirt!
                  </motion.p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Personalize the message & send gratitude today
                  </p>
                </motion.div>
              )}

              {/* Gratitude Intro Section */}
              <GratitudeIntro />

              {/* Epiphany Bridge — Brunson storytelling */}
              <EpiphanyBridge />

              {/* Logo + Gratitude Pack + Discount */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p className="text-center text-2xl md:text-3xl font-bold text-foreground mb-1 leading-tight">
                  This is why <span className="text-primary">IamBlessedAF</span> starts with the most powerful words
                </p>
                <p className="text-center text-4xl md:text-5xl font-black text-primary mb-2">
                  "I AM"
                </p>
                <div className="overflow-hidden -my-6">
                  <img src={logo} alt="I am Blessed AF" className="w-full max-w-sm h-auto object-contain mx-auto" />
                </div>
                <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-4 leading-relaxed">
                  IamBlessedAF is the result of 7+ years of research and experimentation, Co-created alongside a PhD neuroscientist and focused on designing conversation triggers that naturally evoke gratitude.
                </p>
              </motion.div>

              {/* CTA before products */}
              <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <p className="text-center text-3xl md:text-4xl font-black text-primary mb-2">77% OFF TODAY</p>
                <OfferTimer />
                <UrgencyBanner />
                <div className="h-3" />
                  <Button onClick={handleCheckout} disabled={loading} className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl disabled:opacity-70 disabled:animate-none">
                    {loading ? <span className="w-5 h-5 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Crown className="w-5 h-5 mr-2" />}
                    {loading ? "Creating checkout…" : friendName ? `YES! Claim My FREE Custom Shirt for ${friendName} NOW!` : "YES! Claim My FREE Custom Shirt NOW!"}
                    {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                <div className="flex flex-col items-center gap-1.5 mt-3 mb-1">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary fill-primary" />
                    <p className="text-sm font-semibold text-primary">🍽 11 Meals Donated in Honor of Neuroscience</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground max-w-xs text-center">Honoring Huberman's Gratitude Research — donated to Tony Robbins' "1 Billion Meals Challenge"</p>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-1">Instant Gratitude Access + Shipping within 24hrs</p>
                <RiskReversalGuarantee />
              </motion.div>

              <SocialProofSection variant="story" delay={0.25} />

              <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4">GRATITUDE PACK</p>

              <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-6 shadow-soft">
                <p className="text-sm md:text-base italic text-foreground leading-relaxed">
                  "Gratitude isn't created by affirmations, it's activated by receiving genuine appreciation."
                </p>
                <footer className="mt-3"><AuthorAvatar author="huberman" /></footer>
              </blockquote>

              <ProductSections
                afterWristband={
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                    <div className="text-center mb-6"><DiscountBanner /></div>
                    <OfferTimer />
                    <UrgencyBanner />
                    <div className="h-3" />
                    <Button onClick={handleCheckout} disabled={loading} className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl disabled:opacity-70 disabled:animate-none">
                      {loading ? <span className="w-5 h-5 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Crown className="w-5 h-5 mr-2" />}
                      {loading ? "Creating checkout…" : friendName ? `YES! Claim My FREE Custom Shirt for ${friendName} NOW!` : "YES! Claim My FREE Custom Shirt NOW!"}
                      {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                    </Button>
                    <div className="flex flex-col items-center gap-1.5 mt-3 mb-1">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary fill-primary" />
                        <p className="text-sm font-semibold text-primary">🍽 11 Meals Donated in Honor of Neuroscience</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground max-w-xs text-center">Honoring Huberman's Gratitude Research — donated to Tony Robbins' "1 Billion Meals Challenge"</p>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-1">Instant Gratitude Access + Shipping within 24hrs</p>
                    <RiskReversalGuarantee />
                  </motion.div>
                }
              />

              {/* Science Section */}
              <motion.div className="text-center mt-12 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.1 }}>
                <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-6 shadow-soft">
                  <p className="text-sm md:text-base italic text-foreground leading-relaxed">
                    "Most people live in survival emotions like fear, anger, guilt, shame"
                  </p>
                  <footer className="mt-3"><AuthorAvatar author="joe-dispenza" /></footer>
                </blockquote>
                <p className="text-base md:text-lg text-muted-foreground mb-2 max-w-lg mx-auto">
                  Dr. Hawkins — PhD Psychiatrist Research illustrated by this emotional scale, the frequency of{" "}
                  <span className="font-bold text-foreground">shame is 20 Hz</span> and{" "}
                  <span className="font-bold text-foreground">Joy is 540 Hz</span>.
                </p>
                <p className="text-base md:text-lg text-muted-foreground mb-2 max-w-lg mx-auto">
                  Gratitude makes you feel the emotion of <span className="font-bold text-foreground">Joy</span>.
                </p>
                <p className="text-xl md:text-2xl font-bold text-primary mb-6 max-w-lg mx-auto">Hack your Brain to feel up 27x HAPPIER</p>
                <motion.div className="max-w-lg mx-auto mb-6 rounded-2xl overflow-hidden border border-border/50 shadow-soft" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 1.2 }}>
                  <img src={hawkinsScale} alt="Dr. Hawkins Emotional Guidance Scale" className="w-full h-auto object-contain" loading="lazy" />
                </motion.div>
              </motion.div>

              {/* Discount + Second CTA */}
              <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
                <div className="text-center mb-6"><DiscountBanner /></div>
              </motion.div>

              <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.45 }}>
                <OfferTimer />
                <UrgencyBanner />
                <div className="h-3" />
                <Button onClick={handleCheckout} disabled={loading} className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl disabled:opacity-70 disabled:animate-none">
                  {loading ? <span className="w-5 h-5 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Crown className="w-5 h-5 mr-2" />}
                  {loading ? "Creating checkout…" : friendName ? `YES! Claim My FREE Custom Shirt for ${friendName} NOW!` : "YES! Claim My FREE Custom Shirt NOW!"}
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
                <div className="flex flex-col items-center gap-1.5 mt-3 mb-1">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary fill-primary" />
                    <p className="text-sm font-semibold text-primary">🍽 11 Meals Donated in Honor of Neuroscience</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground max-w-xs text-center">Honoring Huberman's Gratitude Research — donated to Tony Robbins' "1 Billion Meals Challenge"</p>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-1">Instant Gratitude Access + Shipping within 24hrs</p>
                <RiskReversalGuarantee />
              </motion.div>

              <p className="text-center text-3xl md:text-4xl font-black text-primary mb-4 mt-8">Backed by Science</p>
              <ResearchList delay={1.5} />

              {/* CTA after research */}
              <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}>
                <OfferTimer />
                <UrgencyBanner />
                <div className="h-3" />
                <Button onClick={handleCheckout} disabled={loading} className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl disabled:opacity-70 disabled:animate-none">
                  {loading ? <span className="w-5 h-5 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Crown className="w-5 h-5 mr-2" />}
                  {loading ? "Creating checkout…" : friendName ? `YES! Claim My FREE Custom Shirt for ${friendName} NOW!` : "YES! Claim My FREE Custom Shirt NOW!"}
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
                <div className="flex flex-col items-center gap-1.5 mt-3 mb-1">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary fill-primary" />
                    <p className="text-sm font-semibold text-primary">🍽 11 Meals Donated in Honor of Neuroscience</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground max-w-xs text-center">Honoring Huberman's Gratitude Research — donated to Tony Robbins' "1 Billion Meals Challenge"</p>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-1">Instant Gratitude Access + Shipping within 24hrs</p>
                <RiskReversalGuarantee />
              </motion.div>

              {/* Live Impact Counter */}
              <ImpactCounter />

              {/* Trust Disclaimer */}
              <motion.div className="mb-8 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.65 }}>
                <div className="border border-border/50 rounded-xl p-5 space-y-3 bg-card">
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
                    <span>✅</span><span>30-Day Money-Back Guarantee — No questions asked</span>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground text-center">
                    <p>🔒 256-bit SSL Encrypted · Secure Payment · Your data is never shared</p>
                    <p>📦 100% Satisfaction Guaranteed · Free US Shipping · International Flat Rate · 7–14 day delivery</p>
                    <p>💳 One-time payment. No subscriptions. No hidden fees.</p>
                    <p>🍽 11 meals donated to Tony Robbins' "1 Billion Meals Challenge" — honoring Huberman's Gratitude Research</p>
                  </div>
                </div>
              </motion.div>

              {/* Viral Share Nudge */}
              <ViralShareNudge />

              {/* Skip Link */}
              <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>
                <a
                  href="/offer/444"
                  onClick={(e) => { e.preventDefault(); setShowDownsell(true); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Maybe later →
                </a>
              </motion.div>

              <DownsellModal
                open={showDownsell}
                onClose={() => setShowDownsell(false)}
                onAccept={() => { setShowDownsell(false); navigate("/offer/11mo"); }}
                onDecline={() => { setShowDownsell(false); navigate("/offer/444"); }}
                onTrack={track}
              />
            </>

        {/* Achievement Unlock Toast */}
        <AchievementUnlockToast achievement={newlyUnlocked} onDismiss={dismissNewlyUnlocked} />
        <CrossFunnelShareNudge />
        </div>
      </div>
    </div>
  );
};

export default Offer111;
