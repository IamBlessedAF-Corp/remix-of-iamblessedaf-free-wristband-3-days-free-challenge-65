import { useState } from "react";
import FreeWristbandStep from "@/components/offer/FreeWristbandStep";
import UpsellWristbandStep from "@/components/offer/UpsellWristbandStep";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import GratitudeSetupFlow from "@/components/challenge/GratitudeSetupFlow";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useAuth } from "@/hooks/useAuth";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";

type Step = "free-wristband" | "gratitude-setup" | "upsell-22";

const Offer22 = () => {
  const [step, setStep] = useState<Step>("free-wristband");
  const [showAuth, setShowAuth] = useState(false);
  const { startCheckout, loading } = useStripeCheckout();
  const { user } = useAuth();

  const handleFreeWristbandCheckout = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setStep("gratitude-setup");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
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

  const handleSkipUpsell = () => {
    startCheckout("free-wristband");
  };

  return (
    <div className="min-h-screen bg-background">
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
