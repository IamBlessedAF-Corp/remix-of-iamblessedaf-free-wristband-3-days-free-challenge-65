import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import FreeWristbandStep from "@/components/offer/FreeWristbandStep";
import UpsellWristbandStep from "@/components/offer/UpsellWristbandStep";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import GratitudeSetupFlow from "@/components/challenge/GratitudeSetupFlow";
import GratitudeIntroScreen from "@/components/challenge/GratitudeIntroScreen";
import GratitudeMicroWin from "@/components/offer/GratitudeMicroWin";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import { supabase } from "@/integrations/supabase/client";

type Step = "free-wristband" | "gratitude-intro" | "gratitude-setup" | "gratitude-win" | "upsell-22";
const STEP_KEY = "offer22-step";

const Offer22 = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStepRaw] = useState<Step>(() => {
    const saved = sessionStorage.getItem(STEP_KEY);
    if (saved && ["free-wristband", "gratitude-intro", "gratitude-setup", "gratitude-win", "upsell-22"].includes(saved)) {
      return saved as Step;
    }
    return "free-wristband";
  });
  const setStep = (newStep: Step) => {
    sessionStorage.setItem(STEP_KEY, newStep);
    setStepRaw(newStep);
  };
  const [showAuth, setShowAuth] = useState(false);
  const [senderName, setSenderName] = useState<string | null>(null);
  const { startCheckout, loading } = useStripeCheckout();
  const { user, loading: authLoading, signOut } = useAuth();

  // Capture referral code from URL and persist to sessionStorage
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      sessionStorage.setItem("referral_code", ref);
      localStorage.setItem("referral_code", ref);
    }
  }, [searchParams]);

  // Authenticated users: write referral attribution + redirect if funnel completed
  useEffect(() => {
    if (!authLoading && user) {
      const checkFunnelStatus = async () => {
        const { data } = await supabase
          .from("creator_profiles")
          .select("congrats_completed, referred_by_code")
          .eq("user_id", user.id)
          .maybeSingle();

        // Write referral attribution if not yet set — resolve code → user_id
        const storedRef = sessionStorage.getItem("referral_code") || localStorage.getItem("referral_code");
        if (storedRef && data && !data.referred_by_code) {
          // Look up the referrer's user_id from their referral_code
          const { data: referrer } = await supabase
            .from("creator_profiles_public")
            .select("user_id")
            .eq("referral_code", storedRef)
            .maybeSingle();

          const updatePayload: Record<string, string> = { referred_by_code: storedRef };
          if (referrer?.user_id) {
            updatePayload.referred_by_user_id = referrer.user_id;
          }

          await supabase
            .from("creator_profiles")
            .update(updatePayload)
            .eq("user_id", user.id);
          sessionStorage.removeItem("referral_code");
          localStorage.removeItem("referral_code");
        }

        // Authenticated user → completed funnel goes to affiliate, everyone else to portal
        if (data?.congrats_completed) {
          navigate("/affiliate-portal", { replace: true });
        } else {
          navigate("/portal", { replace: true });
        }
      };
      checkFunnelStatus();
    }
  }, [user, authLoading, navigate]);

  usePageMeta({
    title: senderName
      ? `${senderName} Sent You a FREE Gratitude Wristband 🎁`
      : "Claim Your FREE Gratitude Wristband | I am Blessed AF",
    description: senderName
       ? `${senderName} wants to share gratitude with you. Claim your FREE Gratitude Wristband and join the movement.`
       : "Get a FREE Gratitude Wristband. Join the movement — 22 meals donated with every order.",
    image: "/og-wristband.png",
    url: "https://iamblessedaf.com/",
  });

  // Look up sender name from user metadata or referral
  useEffect(() => {
    const refCode = sessionStorage.getItem("referral_code");
    if (!refCode) return;
    const lookup = async () => {
      try {
        const { data } = await supabase
          .from("creator_profiles_public")
          .select("display_name")
          .eq("referral_code", refCode)
          .maybeSingle();
        if (data?.display_name) {
          setSenderName(data.display_name.split(" ")[0]);
        }
      } catch {}
    };
    lookup();
  }, []);

  const handleFreeWristbandCheckout = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setStep("gratitude-intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setStep("gratitude-intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleIntroComplete = () => {
    setStep("gratitude-setup");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGratitudeComplete = () => {
    setStep("gratitude-win");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGratitudeSkip = () => {
    setStep("gratitude-win");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMicroWinContinue = () => {
    setStep("upsell-22");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpsellCheckout = () => {
    startCheckout("wristband-22");
  };

  const handleSkipFree = () => {
    // Don't dead-end — show condensed gratitude intro instead
    setStep("gratitude-intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSingleWristbandCheckout = () => {
    startCheckout("free-wristband");
  };

  const handleSkipUpsell = () => {
    window.location.href = "/offer/111";
  };

  return (
    <div className="min-h-screen bg-background">
      {user && (
        <div className="fixed top-3 right-3 z-50">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-background/80 backdrop-blur-sm border border-border/50 rounded-full hover:text-foreground hover:border-border transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}
      <GamificationHeader />

      <CreatorSignupModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {step === "free-wristband" && (
            <FreeWristbandStep
              onCheckout={handleFreeWristbandCheckout}
              onSkip={handleSkipFree}
              senderName={senderName}
            />
          )}
          {step === "gratitude-intro" && (
            <GratitudeIntroScreen
              onContinue={handleIntroComplete}
              onSkip={handleGratitudeSkip}
            />
          )}
          {step === "gratitude-setup" && (
            <GratitudeSetupFlow
              onComplete={handleGratitudeComplete}
              onSkip={handleGratitudeSkip}
            />
          )}
          {step === "gratitude-win" && (
            <GratitudeMicroWin onContinue={handleMicroWinContinue} />
          )}
          {step === "upsell-22" && (
            <UpsellWristbandStep
              onCheckout={handleUpsellCheckout}
              onSingleCheckout={handleSingleWristbandCheckout}
              onSkip={handleSkipUpsell}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Offer22;
