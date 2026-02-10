import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import { CreatorNextSteps } from "@/components/contest/CreatorNextSteps";
import ClipperCalculator from "@/components/contest/ClipperCalculator";
import ClipCtaInfo from "@/components/contest/ClipCtaInfo";
import ContestHero from "@/components/contest/ContestHero";
import ContestProblem from "@/components/contest/ContestProblem";
import ContestOfferStack from "@/components/contest/ContestOfferStack";
import ContestSocialProof from "@/components/contest/ContestSocialProof";
import ContestGuarantees from "@/components/contest/ContestGuarantees";
import ContestHowItWorks from "@/components/contest/ContestHowItWorks";
import InspirationGallery from "@/components/contest/InspirationGallery";

const AIVideoContest = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, loading } = useAuth();

  const openSignup = () => setShowSignupModal(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <ContestHero logo={logo} onJoin={openSignup} />

      {/* Earnings Calculator */}
      <section className="px-4 py-8 max-w-4xl mx-auto">
        <ClipperCalculator />
      </section>

      {/* Clip CTA Info */}
      <section className="px-4 max-w-4xl mx-auto">
        <ClipCtaInfo />
      </section>

      {/* Problem + False Beliefs + Epiphany */}
      <ContestProblem />

      {/* Offer Stack */}
      <ContestOfferStack />

      {/* Social Proof */}
      <ContestSocialProof />

      {/* Guarantees */}
      <ContestGuarantees />

      {/* How It Works */}
      <ContestHowItWorks />

      {/* Inspiration Gallery */}
      <InspirationGallery />

      {/* CTA Section */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : user ? (
          <CreatorNextSteps />
        ) : (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Math Doesn't Lie. <span className="text-primary">Claim Your Spot.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
              $2.22 guaranteed per clip. $0.22/1k views. $1,111 payout pool.<br />
              Remix gratitude clips. Rewire brains. Get paid.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-lg"
                onClick={openSignup}
              >
                Claim My Clipper Spot →
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14"
                onClick={() => window.open("https://www.instagram.com/iamblessedaf", "_blank")}
              >
                Follow @IamBlessedAF
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Questions? DM @JoeDaVincy. No BS, just math. 🏀
            </p>
          </motion.div>
        )}
      </section>

      <CreatorSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSuccess={() => setShowSignupModal(false)}
      />
    </div>
  );
};

export default AIVideoContest;
