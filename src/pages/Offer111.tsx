import { motion } from "framer-motion";
import { Crown, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import hawkinsScale from "@/assets/hawkins-scale.jpg";
import GratitudeIntro from "@/components/offer/GratitudeIntro";
import DiscountBanner from "@/components/offer/DiscountBanner";
import ProductSections from "@/components/offer/ProductSections";
import logo from "@/assets/logo.png";

const Offer111 = () => {
  const handleCheckout = () => {
    // Placeholder for Stripe checkout
    if (import.meta.env.DEV) {
      console.log("Redirecting to Stripe checkout for $111 pack");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Unlock Badge */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              <Lock className="w-4 h-4" />
              Unlocked! You completed the 3-Day Challenge
            </div>
          </motion.div>

          {/* Gratitude Intro Section */}
          <GratitudeIntro />

          {/* Logo + Gratitude Pack + Discount — unified block */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img
              src={logo}
              alt="I am Blessed AF"
              className="w-full max-w-sm h-auto object-contain mx-auto mb-1"
            />
            <p className="text-lg font-bold text-foreground mb-2">Gratitude Pack</p>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-4 leading-relaxed">
              Co-created alongside a PhD neuroscientist, IamBlessedAF is the result of 7+ years of research and experimentation focused on designing conversation triggers that naturally evoke gratitude.
            </p>

            {/* Discount inline */}
            <DiscountBanner />
          </motion.div>

          {/* CTA before products */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleCheckout}
              className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
            >
              <Crown className="w-5 h-5 mr-2" />
              Claim Your Gratitude Pack — $111
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              🔒 Secure checkout • FREE Shipping
            </p>
          </motion.div>

          {/* Product Sections */}
          <ProductSections />

          {/* Science Section — moved below CTA */}
          <motion.div
            className="text-center mt-12 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <p className="text-base md:text-lg text-muted-foreground mb-2 max-w-lg mx-auto">
              Dr. Hawkins — PhD Psychiatrist Research illustrated by this emotional scale, the frequency of{" "}
              <span className="font-bold text-foreground">shame is 20 Hz</span> and{" "}
              <span className="font-bold text-foreground">Joy is 540 Hz</span>.
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-2 max-w-lg mx-auto">
              Gratitude makes you feel the emotion of <span className="font-bold text-foreground">Joy</span>.
            </p>
            <p className="text-xl md:text-2xl font-bold text-primary mb-6 max-w-lg mx-auto">
              THAT'S 27x HAPPIER
            </p>

            {/* Hawkins Emotional Guidance Scale */}
            <motion.div
              className="max-w-lg mx-auto mb-6 rounded-2xl overflow-hidden border border-border/50 shadow-soft"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <img
                src={hawkinsScale}
                alt="Dr. Hawkins Emotional Guidance Scale"
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </motion.div>

            {/* Huberman Quote */}
            <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-6 shadow-soft">
              <p className="text-sm md:text-base italic text-foreground leading-relaxed">
                "Gratitude isn't created by affirmations, it's activated by receiving genuine appreciation."
              </p>
              <footer className="mt-3 text-xs md:text-sm text-muted-foreground font-semibold">
                — Andrew Huberman, Neuroscientist
              </footer>
            </blockquote>

            {/* Huberman Video Clip */}
            <p className="text-sm md:text-base italic text-muted-foreground max-w-lg mx-auto mb-3 leading-relaxed">
              "The Biggest Surprise in researching since i started the podcast is how GRATITUDE skyrocket{" "}
              <span className="font-bold text-foreground">DOPAMINE</span> &{" "}
              <span className="font-bold text-foreground">SEROTONIN</span>..."
            </p>
            <motion.div
              className="max-w-lg mx-auto mb-4 rounded-2xl overflow-hidden border border-border/50 shadow-soft"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            >
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/ph1BuMRFJ88"
                  title="Huberman on Gratitude"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </motion.div>

            {/* Video context note */}
            <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed">
              In the full 1-hour and 25-minute version of a Joe Rogan podcast episode, Stanford neuroscientist Andrew Huberman breaks down the science of gratitude, referencing over eight peer-reviewed studies and revealing the most effective way to experience the real benefits of a gratitude practice.
            </p>
          </motion.div>

          {/* Second CTA */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <Button
              onClick={handleCheckout}
              className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
            >
              <Crown className="w-5 h-5 mr-2" />
              Claim Your Gratitude Pack — $111
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              🔒 Secure checkout • FREE Shipping
            </p>
          </motion.div>

          {/* Research List */}
          <motion.div
            className="text-left max-w-lg mx-auto mt-12 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <h3 className="text-lg md:text-xl font-bold text-foreground text-center mb-6">
              📚 Science of Gratitude — Research List (Huberman Lab)
            </h3>

            <div className="space-y-5">
              {[
                {
                  title: "Conscious Processing of Narrative Stimulates Synchronization of Heart Rate Between Individuals",
                  year: "2017",
                  authors: "Pérez et al.",
                  keyphrase: "Narrative synchronizes heart rate and physiology across individuals.",
                },
                {
                  title: "Prefrontal Activation While Listening to a Letter of Gratitude Read Aloud by a Coworker: A NIRS Study",
                  year: "2014",
                  authors: "Fox et al.",
                  keyphrase: "Receiving gratitude activates the prefrontal cortex more than expressing it.",
                },
                {
                  title: "Neural Responses to Intention and Benefit Appraisal Are Critical in Distinguishing Gratitude and Joy",
                  year: "2018",
                  authors: "Yu et al.",
                  keyphrase: "The brain detects genuine gratitude; intention matters more than the reward.",
                },
                {
                  title: "Effects of Gratitude Meditation on Neural Network Functional Connectivity and Brain–Heart Coupling",
                  year: "2020",
                  authors: "Kral et al.",
                  keyphrase: "Repeated gratitude reshapes emotion, fear, and motivation circuits.",
                },
                {
                  title: "Exploring Neural Mechanisms of the Health Benefits of Gratitude in Women: A Randomized Controlled Trial",
                  year: "2021",
                  authors: "Hazlitt et al.",
                  keyphrase: "Gratitude reduces amygdala activity and inflammatory markers (TNF-α, IL-6).",
                },
                {
                  title: "Neural Correlates of Gratitude",
                  year: "2015",
                  authors: "Antonio Damasio et al.",
                  keyphrase: "Gratitude activates medial prefrontal and anterior cingulate cortex.",
                },
                {
                  title: "Counting Blessings Versus Burdens: An Experimental Investigation of Gratitude and Subjective Well-Being",
                  year: "2003",
                  authors: "Emmons & McCullough",
                  keyphrase: "Weekly gratitude practice produces lasting wellbeing improvements.",
                },
                {
                  title: "The Happiness Advantage (Applied Research, Positive Psychology)",
                  year: "2010",
                  authors: "Shawn Achor",
                  keyphrase: "Gratitude is one of the fastest interventions to increase happiness and performance.",
                },
              ].map((study, i) => (
                <div key={i} className="bg-card border border-border/50 rounded-xl p-4 shadow-soft">
                  <p className="text-sm font-semibold text-foreground leading-snug mb-1">
                    {study.title}
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">
                    {study.year} — {study.authors}
                  </p>
                  <p className="text-xs italic text-muted-foreground">
                    Keyphrase: {study.keyphrase}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA after research */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <Button
              onClick={handleCheckout}
              className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
            >
              <Crown className="w-5 h-5 mr-2" />
              Claim Your Gratitude Pack — $111
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              🔒 Secure checkout • FREE Shipping
            </p>
          </motion.div>

          {/* Skip Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
          >
            <a
              href="/challenge/thanks"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later →
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Offer111;
