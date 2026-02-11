import { useState } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import GratitudeClippersHero from "@/components/contest/GratitudeClippersHero";
import EarningsSliderCalculator from "@/components/contest/EarningsSliderCalculator";
import BonusLadder from "@/components/contest/BonusLadder";
import ClipperCtaAssets from "@/components/contest/ClipperCtaAssets";
import InspirationGallery from "@/components/contest/InspirationGallery";
import ProcessCta from "@/components/contest/ProcessCta";
import ClipperFaq from "@/components/contest/ClipperFaq";
import TrustSignals from "@/components/contest/TrustSignals";
import StickyClipperBar from "@/components/contest/StickyClipperBar";
import GratitudeDegenBlock from "@/components/contest/GratitudeDegenBlock";

const GratitudeClippers = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, loading } = useAuth();

  usePageMeta({
    title: "Clip Gratitude Viral Content. Get Paid $2.22–$1,111 Per Clip",
    description: "Remix viral gratitude clips from Tony Robbins & Huberman. Add our free CTA end-screen. Post on TikTok/Reels/Shorts. Get paid $2.22–$1,111 per clip.",
    image: "/og-clippers.png",
    url: "https://iamblessedaf.com/Gratitude-Clippers",
  });

  const openSignup = () => setShowSignupModal(true);

  const handleSignupSuccess = () => {
    setShowSignupModal(false);
    window.location.href = "/clipper-dashboard";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Hero — what you do + what you earn */}
      <GratitudeClippersHero logo={logo} onJoin={openSignup} />

      {/* 2. Degen scenarios — quick visual proof */}
      <GratitudeDegenBlock />

      {/* 3. Interactive earnings calculator */}
      <EarningsSliderCalculator />

      {/* 3. Bonus ladder + 25k accelerator */}
      <BonusLadder />

      {/* 4. Trust + guarantees (merged) */}
      <TrustSignals />

      {/* 5. CTA Assets — downloadable end-screens & captions */}
      <ClipperCtaAssets />

      {/* 6. Content Vault — clips to remix */}
      <InspirationGallery />

      {/* 7. FAQ */}
      <ClipperFaq />

      {/* 8. Final CTA */}
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
        onSuccess={handleSignupSuccess}
      />

      <StickyClipperBar onJoin={openSignup} />
    </div>
  );
};

export default GratitudeClippers;
