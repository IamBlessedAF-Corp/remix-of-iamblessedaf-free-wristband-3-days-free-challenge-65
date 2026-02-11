import { useState } from "react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import GratitudeClippersHero from "@/components/contest/GratitudeClippersHero";
import GratitudeDegenBlock from "@/components/contest/GratitudeDegenBlock";
import ClipperCalculator from "@/components/contest/ClipperCalculator";
import EarningsSliderCalculator from "@/components/contest/EarningsSliderCalculator";
import ContestGuarantees from "@/components/contest/ContestGuarantees";
import BonusLadder from "@/components/contest/BonusLadder";
import TrustSignals from "@/components/contest/TrustSignals";
import InspirationGallery from "@/components/contest/InspirationGallery";
import ProcessCta from "@/components/contest/ProcessCta";
import ClipperFaq from "@/components/contest/ClipperFaq";
import First25kAccelerator from "@/components/contest/First25kAccelerator";

const GratitudeClippers = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, loading } = useAuth();

  const openSignup = () => setShowSignupModal(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Hero — A/B variant: gratitude-first framing */}
      <GratitudeClippersHero logo={logo} onJoin={openSignup} />

      {/* 2a. Degen Hook — high-output path */}
      <GratitudeDegenBlock />

      {/* 2b. Earnings snapshot — Stable/Degen toggle */}
      <ClipperCalculator />

      {/* 2c. Interactive slider calculator */}
      <EarningsSliderCalculator />

      {/* 3. Risk reversal / guarantees — reduce fear */}
      <ContestGuarantees />

      {/* 3b. First 25k Accelerator — early momentum */}
      <First25kAccelerator />

      {/* 4. Bonus ladder — visible progression */}
      <BonusLadder />

      {/* FAQ */}
      <ClipperFaq />

      {/* 5. Trust & anti-scam — transparency signals + live stats */}
      <TrustSignals />

      {/* Content Vault — clips to remix */}
      <InspirationGallery />

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

export default GratitudeClippers;
