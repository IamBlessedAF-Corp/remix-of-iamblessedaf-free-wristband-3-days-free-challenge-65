import { useState, useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import FreeWristbandStep from "@/components/offer/FreeWristbandStep";
import UpsellWristbandStep from "@/components/offer/UpsellWristbandStep";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import GratitudeSetupFlow from "@/components/challenge/GratitudeSetupFlow";
import GratitudeIntroScreen from "@/components/challenge/GratitudeIntroScreen";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import { supabase } from "@/integrations/supabase/client";

type Step = "free-wristband" | "gratitude-intro" | "gratitude-setup" | "upsell-22";

const Offer22 = () => {
  const [step, setStep] = useState<Step>("free-wristband");
  const [showAuth, setShowAuth] = useState(false);
  const [senderName, setSenderName] = useState<string | null>(null);
  const { startCheckout, loading } = useStripeCheckout();
  const { user, signOut } = useAuth();

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
    setStep("upsell-22");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGratitudeSkip = () => {
    setStep("upsell-22");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpsellCheckout = () => {
    startCheckout("wristband-22");
  };

  const handleSkipFree = () => {
    window.location.href = "/challenge/thanks";
  };

  const handleSingleWristbandCheckout = () => {
    startCheckout("free-wristband");
  };

  const handleSkipUpsell = () => {
    window.location.href = "/challenge/thanks";
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
            Cerrar sesión
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
