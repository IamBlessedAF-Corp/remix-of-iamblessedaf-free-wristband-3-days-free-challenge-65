import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  Truck,
  Shield,
  Sparkles,
  Check,
  Gift,
  Lock,
  ChevronRight,
  Zap,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MpfcTooltip from "@/components/offer/MpfcTooltip";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useKeyStatus } from "@/hooks/useKeyStatus";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo.png";
import productWristbands from "@/assets/product-wristbands-new.avif";

// ── Helpers ──────────────────────────────────────────────────────
const from = (table: string) => supabase.from(table as any);

const FEATURES = [
  "NFC TAP Neuro-Hack Technology",
  "mPFC Activation on Autopilot",
  "Zero Battery — Works Forever",
  "Dopamine × Serotonin Daily Spike",
  "Premium Silicone Band",
  "Lifetime Access to App Updates",
];

// ── Component ────────────────────────────────────────────────────
const OfferWristband = () => {
  usePageMeta({
    title: "Claim Your mPFC Neuro-Hacker Wristband | IamBlessedAF",
    description:
      "Get the world's first smart wearable neuro-hack. Free shipping for Master Key holders.",
    image: "/og-wristband.png",
    url: "https://iamblessedaf.com/offer/wristband",
  });

  const navigate = useNavigate();
  const { hasMasterKey, hasShippingCredit, isAuthenticated, loading, userId } =
    useKeyStatus();
  const { startCheckout, loading: checkoutLoading } = useStripeCheckout();
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // ── Free claim handler (Master Key holders) ──
  const handleFreeClaim = async () => {
    if (!userId) return;
    setClaimLoading(true);
    try {
      // Record the free shipping claim
      const { error } = await from("keys_status")
        .update({ shipping_credit_applied: true } as any)
        .eq("user_id", userId);

      if (error) {
        console.error("Free claim error:", error);
        setClaimLoading(false);
        return;
      }

      setClaimed(true);
      setClaimLoading(false);
    } catch (err) {
      console.error("Free claim exception:", err);
      setClaimLoading(false);
    }
  };

  // ── Paid checkout handler ──
  const handlePaidCheckout = async () => {
    try {
      await startCheckout("wristband-22" as any);
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Claimed success state ──
  if (claimed) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <section className="relative py-12 px-4 text-center max-w-2xl mx-auto">
          <motion.img
            src={logoImg}
            alt="IamBlessedAF"
            className="h-10 mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <motion.div
            className="bg-card border-2 border-primary/30 rounded-2xl p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black mb-3">
              🎉 Your Wristband Is On Its Way!
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              As a <span className="text-primary font-bold">Master Key</span>{" "}
              holder, your{" "}
              <strong className="text-foreground">
                mPFC Neuro-Hacker Wristband
              </strong>{" "}
              ships{" "}
              <span className="text-primary font-bold">100% FREE</span>.
              We'll email you tracking details soon.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/keys")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
              >
                <Crown className="w-4 h-4 mr-2" />
                Back to My Keys
              </Button>
              <Button
                onClick={() => navigate("/challenge")}
                variant="outline"
                className="w-full rounded-xl"
              >
                Share the Challenge
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    );
  }

  // ── Determine which path to show ──
  const isFreeEligible = hasMasterKey && hasShippingCredit === false;
  const alreadyClaimed = hasShippingCredit;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <section className="relative py-12 px-4 text-center max-w-2xl mx-auto">
        {/* ── Logo ── */}
        <motion.img
          src={logoImg}
          alt="IamBlessedAF"
          className="h-10 mx-auto mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-3">
            {isFreeEligible
              ? "🏆 Master Key Reward"
              : alreadyClaimed
              ? "✅ Already Claimed"
              : "🧠 Get Your Wristband"}
          </p>
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
            <span className="text-primary">mPFC</span> Neuro-Hacker
            <br />
            Wristband{" "}
            <span className="text-primary">SMART</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-lg mx-auto">
            The world's first{" "}
            <strong className="text-foreground">
              zero-battery smart wearable
            </strong>{" "}
            that activates your <MpfcTooltip /> to trigger a{" "}
            <strong className="text-primary">
              Dopamine × Serotonin spike
            </strong>{" "}
            on autopilot.
          </p>
        </motion.div>

        {/* ── Product Image ── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
        >
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-soft">
            <div className="aspect-[4/3] flex items-center justify-center p-6 bg-secondary/20">
              <img
                src={productWristbands}
                alt="mPFC Neuro-Hacker Wristband SMART"
                className="max-w-full max-h-full object-contain drop-shadow-lg"
                loading="eager"
              />
            </div>
          </div>
        </motion.div>

        {/* ── Checkout Card ── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* PATH A: Master Key = FREE shipping */}
          {isFreeEligible && (
            <div className="bg-card border-2 border-primary rounded-2xl p-6 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-4">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black text-primary uppercase tracking-wide">
                    Master Key Holder
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black mb-2">
                  FREE Shipping{" "}
                  <span className="text-primary">Unlocked! 🎉</span>
                </h2>

                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-muted-foreground line-through text-lg">
                    $7.97
                  </span>
                  <span className="text-3xl font-black text-primary">
                    $0.00
                  </span>
                  <span className="bg-primary text-primary-foreground text-xs font-black px-2 py-1 rounded-full">
                    100% OFF
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                  You completed all 4 Joy Keys. Your wristband ships{" "}
                  <strong className="text-foreground">completely free</strong>.
                  No card needed.
                </p>

                <Button
                  onClick={handleFreeClaim}
                  disabled={claimLoading}
                  className="w-full min-h-[56px] h-auto text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
                >
                  {claimLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      Claim Your FREE Wristband
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Ships within 5–7 business days
                </p>
              </div>
            </div>
          )}

          {/* Already claimed */}
          {alreadyClaimed && (
            <div className="bg-card border-2 border-primary/30 rounded-2xl p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-black mb-2">
                Wristband Already Claimed ✅
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Your <strong className="text-foreground">mPFC Neuro-Hacker Wristband</strong> is on its way!
                Check your email for tracking details.
              </p>
              <Button
                onClick={() => navigate("/keys")}
                variant="outline"
                className="rounded-xl"
              >
                <Crown className="w-4 h-4 mr-2" />
                View My Keys
              </Button>
            </div>
          )}

          {/* PATH B: Not a Master Key holder = Paid checkout */}
          {!isFreeEligible && !alreadyClaimed && (
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="text-2xl font-black mb-2">
                Get Your Wristband Today 🧠
              </h2>

              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-3xl font-black text-foreground">
                  $7.97
                </span>
                <span className="text-xs text-muted-foreground">
                  shipping & handling
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                The wristband is{" "}
                <strong className="text-foreground">FREE</strong> — you only
                cover shipping.
              </p>

              {/* Free shipping unlock hint */}
              {isAuthenticated && !hasMasterKey && (
                <motion.div
                  className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-xs text-muted-foreground">
                    <Lock className="w-3 h-3 inline mr-1" />
                    <strong className="text-foreground">
                      Want FREE shipping?
                    </strong>{" "}
                    Complete all 4{" "}
                    <button
                      onClick={() => navigate("/keys")}
                      className="text-primary font-bold underline underline-offset-2"
                    >
                      Joy Keys
                    </button>{" "}
                    to unlock the Master Key and ship for{" "}
                    <span className="text-primary font-bold">$0.00</span>
                  </p>
                </motion.div>
              )}

              <Button
                onClick={handlePaidCheckout}
                disabled={checkoutLoading}
                className="w-full min-h-[56px] h-auto text-lg font-black bg-foreground hover:bg-foreground/90 text-background rounded-xl gap-2"
              >
                {checkoutLoading ? (
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Truck className="w-5 h-5" />
                    Ship Now — $7.97
                  </>
                )}
              </Button>

              {!isAuthenticated && (
                <p className="text-xs text-muted-foreground mt-3">
                  <button
                    onClick={() => navigate("/challenge")}
                    className="text-primary font-bold underline underline-offset-2"
                  >
                    Join the Challenge first
                  </button>{" "}
                  to unlock FREE shipping
                </p>
              )}

              <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Secure checkout via Stripe
              </p>
            </div>
          )}
        </motion.div>

        {/* ── Features List ── */}
        <motion.div
          className="mb-8 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 text-center">
            What's Included
          </p>
          <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {f}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Science Section ── */}
        <motion.div
          className="mb-8 bg-card border border-border/50 rounded-2xl p-5 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-primary" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              The Science
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Your <MpfcTooltip /> —{" "}
            <strong className="text-foreground">
              medial Prefrontal Cortex
            </strong>{" "}
            — only fires its full{" "}
            <strong className="text-primary">Dopamine × Serotonin</strong>{" "}
            cascade when you{" "}
            <em className="text-foreground font-semibold">
              receive genuine gratitude
            </em>
            .
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The{" "}
            <strong className="text-foreground">
              NFC TAP
            </strong>{" "}
            on this wristband triggers that loop{" "}
            <strong className="text-primary">automatically</strong> — turning a
            simple daily tap into a{" "}
            <strong className="text-foreground">
              neuroplasticity habit
            </strong>{" "}
            that rewires your brain for happiness.
          </p>
        </motion.div>

        {/* ── Joy Keys CTA (for non-Master Key users) ── */}
        {!hasMasterKey && isAuthenticated && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-xs font-black uppercase tracking-wider text-primary">
                  Unlock Free Shipping
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Complete all 4 Joy Keys → Master Key →{" "}
                <strong className="text-primary">$0 shipping forever</strong>
              </p>
              <Button
                onClick={() => navigate("/keys")}
                variant="outline"
                className="rounded-xl border-primary/30 text-primary hover:bg-primary/10"
              >
                <Zap className="w-4 h-4 mr-2" />
                View My Joy Keys
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Footer ── */}
        <motion.p
          className="text-xs text-muted-foreground mt-6 max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Questions?{" "}
          <a
            href="mailto:hello@iamblessedaf.com"
            className="text-primary underline underline-offset-2"
          >
            hello@iamblessedaf.com
          </a>
          <br />
          <button
            onClick={() => navigate("/privacy")}
            className="text-muted-foreground underline underline-offset-2 mr-3"
          >
            Privacy
          </button>
          <button
            onClick={() => navigate("/terms")}
            className="text-muted-foreground underline underline-offset-2"
          >
            Terms
          </button>
        </motion.p>
      </section>
    </div>
  );
};

export default OfferWristband;
