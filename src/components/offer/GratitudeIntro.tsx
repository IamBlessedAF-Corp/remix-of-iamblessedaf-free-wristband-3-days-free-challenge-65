import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendShirtSection } from "@/components/offer/ProductSections";

import OfferTimer from "@/components/offer/OfferTimer";
import RiskReversalGuarantee from "@/components/offer/RiskReversalGuarantee";
import AuthorAvatar from "@/components/offer/AuthorAvatar";

const GratitudeIntro = () => {

  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Context badge — acknowledge $22 purchase */}
      <div className="inline-flex items-center gap-2 bg-accent/50 text-foreground px-4 py-2 rounded-full text-sm font-semibold mb-4">
        ✅ 3 Wristbands Locked In · Now Claim Your <span className="text-primary font-bold">FREE Shirt</span>
      </div>

      {/* Headline — simple, benefit-first */}
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        You Just Started Rewiring Your Brain.{" "}
        <span className="text-primary">Now Make It Permanent</span> — With a Gift Your Friend Will Never Forget 🧠
      </h2>

      <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-4 shadow-soft">
        <p className="text-sm md:text-base italic text-foreground leading-relaxed">
          "It turns out that the most potent form of gratitude practice is not a gratitude practice where you give gratitude or express gratitude, but rather where you receive gratitude, where you receive thanks.
          <br /><br />
          ...Receiving gratitude is actually much more potent, in terms of the positive shifts that that can create, than giving gratitude."
        </p>
        <footer className="mt-3">
          <AuthorAvatar author="huberman" />
        </footer>
      </blockquote>

      <p className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2 leading-tight">
        That's Why We Want to Send Your Best Friend a Custom Shirt with a Message from <span className="text-primary">You!</span>
      </p>

      {/* Countdown timer */}
      <OfferTimer />
      <div className="h-4" />

      {/* Friend Shirt showcase */}
      <FriendShirtSection delay={0.15} />

      <p className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2 leading-tight">
        Claim Your <span className="text-primary">FREE</span> Custom Shirt → Make Someone's Day
      </p>

      <OfferTimer />
      <div className="h-3" />

      <Button
        className="w-full max-w-lg mx-auto h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl mb-1"
      >
        YES! Send My Friend This FREE Shirt
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-2">
        🍽 Free US Shipping • Meals donated with every order
      </p>
      <RiskReversalGuarantee />

      {/* Tony Robbins quote — moved after first CTA */}
      <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-4 shadow-soft">
        <p className="text-sm md:text-base italic text-foreground leading-relaxed">
          "Gratitude is the fastest & repeatable way to shift emotional state by changing physiology and perception. Make it a daily ritual."
        </p>
        <footer className="mt-3">
          <AuthorAvatar author="tony-robbins" />
        </footer>
      </blockquote>

      {/* Huberman Video Clip — between quotes */}
      <p className="text-sm md:text-base italic text-muted-foreground max-w-lg mx-auto mb-3 leading-relaxed">
        "The Biggest Surprise in researching since i started the podcast is how GRATITUDE skyrocket{" "}
        <span className="font-bold text-foreground">DOPAMINE</span> &{" "}
        <span className="font-bold text-foreground">SEROTONIN</span>..."
      </p>
      <motion.div
        className="max-w-lg mx-auto mb-4 rounded-2xl overflow-hidden border border-border/50 shadow-soft"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
      <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed">
        In the full 1-hour and 25-minute version of a Joe Rogan podcast episode, Stanford neuroscientist Andrew Huberman breaks down the science of gratitude, referencing over eight peer-reviewed studies and revealing the most effective way to experience the real benefits of a gratitude practice.
      </p>

      <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-6 shadow-soft">
        <p className="text-sm md:text-base italic text-foreground leading-relaxed">
          "Whatever you consistently attach to 'I am' with strong emotion and repetition—such as 'I am bold'—you will eventually become. Unlike saying 'I'm going to be bold.'"
        </p>
        <footer className="mt-3">
          <AuthorAvatar author="tony-robbins" />
        </footer>
      </blockquote>
    </motion.div>
  );
};

export default GratitudeIntro;
