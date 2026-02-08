import { useState } from "react";
import FreeWristbandStep from "@/components/offer/FreeWristbandStep";
import UpsellWristbandStep from "@/components/offer/UpsellWristbandStep";

type Step = "free-wristband" | "upsell-22";

const Offer22 = () => {
  const [step, setStep] = useState<Step>("free-wristband");

  const handleFreeWristbandCheckout = () => {
    // Instead of going to Stripe for $9.95, show the upsell first
    setStep("upsell-22");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpsellCheckout = () => {
    if (import.meta.env.DEV) {
      console.log("Redirecting to Stripe checkout for $22 pack (3 wristbands + free shipping + 22 meals)");
    }
    // TODO: Stripe checkout for $22 pack
  };

  const handleSkipFree = () => {
    window.location.href = "/challenge/thanks";
  };

  const handleSkipUpsell = () => {
    if (import.meta.env.DEV) {
      console.log("Redirecting to Stripe checkout for FREE wristband ($9.95 shipping)");
    }
    // TODO: Stripe checkout for free wristband + $9.95 shipping
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {step === "free-wristband" && (
            <FreeWristbandStep
              onCheckout={handleFreeWristbandCheckout}
              onSkip={handleSkipFree}
            />
          )}
          {step === "upsell-22" && (
            <UpsellWristbandStep
              onCheckout={handleUpsellCheckout}
              onSkip={handleSkipUpsell}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Offer22;
