import { useState } from "react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import ContestHero from "@/components/contest/ContestHero";
import DegenHookBlock from "@/components/contest/DegenHookBlock";
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

      {/* 2a. Degen Hook — high-output path */}
      <DegenHookBlock />

      {/* 2b. Earnings snapshot — Stable/Degen toggle */}
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
        <section className="px-4 py-14 max-w-3xl mx-auto text-center space-y-4">
          <p className="text-lg font-bold text-foreground">You're signed in ✅</p>
          <a
            href="/clipper-dashboard"
            className="inline-flex items-center justify-center h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors btn-glow"
          >
            Open Your Clipper Dashboard →
          </a>
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
