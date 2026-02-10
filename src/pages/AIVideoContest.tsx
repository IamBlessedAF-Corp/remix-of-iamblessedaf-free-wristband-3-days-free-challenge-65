import { useState } from "react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import { CreatorNextSteps } from "@/components/contest/CreatorNextSteps";
import ContestHero from "@/components/contest/ContestHero";
import ClipperCalculator from "@/components/contest/ClipperCalculator";
import ContestGuarantees from "@/components/contest/ContestGuarantees";
import BonusLadder from "@/components/contest/BonusLadder";
import TrustSignals from "@/components/contest/TrustSignals";
import ProcessCta from "@/components/contest/ProcessCta";
import ClipperFaq from "@/components/contest/ClipperFaq";

const AIVideoContest = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, loading } = useAuth();

  const openSignup = () => setShowSignupModal(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Hero — immediate clarity */}
      <ContestHero logo={logo} onJoin={openSignup} />

      {/* 2. Earnings snapshot — remove all math thinking */}
      <ClipperCalculator />

      {/* 3. Risk reversal / guarantees — reduce fear */}
      <ContestGuarantees />

      {/* 4. Bonus ladder — visible progression */}
      <BonusLadder />

      {/* FAQ */}
      <ClipperFaq />

      {/* 5. Trust & anti-scam — transparency signals */}
      <TrustSignals />

      {/* 6. CTA — process framing, not urgency */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : user ? (
        <section className="px-4 py-14 max-w-3xl mx-auto">
          <CreatorNextSteps />
        </section>
      ) : (
        <ProcessCta onJoin={openSignup} />
      )}

      <CreatorSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSuccess={() => setShowSignupModal(false)}
      />
    </div>
  );
};

export default AIVideoContest;
