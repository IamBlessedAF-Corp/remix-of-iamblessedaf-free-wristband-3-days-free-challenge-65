// Updated clipper funnel: /3300us-Credit-Clipper
// Adds $3,300 credit positioning + Joe Da Vincy testimonials
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
import InfluencerTestimonials from "@/components/lead-pages/InfluencerTestimonials";
import LeadPageCountdown from "@/components/lead-pages/LeadPageCountdown";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles } from "lucide-react";

const CreditClipper = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, loading } = useAuth();

  usePageMeta({
    title: "Clip Gratitude Viral Content + Get $3,300 Marketing Credit",
    description: "Get paid $2.22–$1,111 per clip PLUS a $3,300 marketing credit from Joe Da Vincy. Remix viral gratitude clips. Post on TikTok/Reels/Shorts.",
    image: "/og-clippers.png",
    url: "https://iamblessedaf.com/3300us-Credit-Clipper",
  });

  const openSignup = () => setShowSignupModal(true);
  const handleSignupSuccess = () => {
    setShowSignupModal(false);
    window.location.href = "/clipper-dashboard";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* $3,300 Credit Banner */}
      <motion.div
        className="bg-primary/10 border-b border-primary/20 px-4 py-3 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Gift className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">
            🎁 You're also getting a <span className="text-primary">FREE $3,300 Marketing Credit</span> from Joe Da Vincy
          </span>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
            <Sparkles className="w-2.5 h-2.5 mr-0.5" /> LIMITED
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Same proven system Inc 5000 companies paid $25,000 for — valued at $9,700 — yours FREE for the next 30 days.
        </p>
      </motion.div>

      {/* 1. Hero — what you do + what you earn */}
      <GratitudeClippersHero logo={logo} onJoin={openSignup} />

      {/* Countdown */}
      <div className="max-w-md mx-auto px-4 mb-6">
        <LeadPageCountdown />
      </div>

      {/* 2. Joe Da Vincy + Influencer Testimonials */}
      <InfluencerTestimonials />

      {/* 3. Degen scenarios — quick visual proof */}
      <GratitudeDegenBlock />

      {/* 4. Interactive earnings calculator */}
      <EarningsSliderCalculator />

      {/* 5. Bonus ladder + 25k accelerator */}
      <BonusLadder />

      {/* 6. Trust + guarantees (merged) */}
      <TrustSignals />

      {/* 7. CTA Assets — downloadable end-screens & captions */}
      <ClipperCtaAssets />

      {/* 8. Content Vault — clips to remix */}
      <InspirationGallery />

      {/* 9. FAQ */}
      <ClipperFaq />

      {/* 10. Final CTA */}
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

export default CreditClipper;
