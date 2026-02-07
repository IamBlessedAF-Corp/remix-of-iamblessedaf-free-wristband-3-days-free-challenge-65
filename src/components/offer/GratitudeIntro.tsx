import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendShirtSection } from "@/components/offer/ProductSections";
import CustomMessageBox from "@/components/offer/CustomMessageBox";

const GratitudeIntro = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        <span className="text-3xl md:text-4xl">🎉</span> Congrats! You Gave the 1st Step to Rewire Your{" "}
        <span className="text-primary">BRAIN</span> to Feel Happier!{" "}
        <span className="text-3xl md:text-4xl">🧠</span>
      </h2>

      <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-4 shadow-soft">
        <p className="text-sm md:text-base italic text-foreground leading-relaxed">
          "It turns out that the most potent form of gratitude practice is not a gratitude practice where you give gratitude or express gratitude, but rather where you receive gratitude, where you receive thanks.
          <br /><br />
          ...Receiving gratitude is actually much more potent, in terms of the positive shifts that that can create, than giving gratitude."
        </p>
        <footer className="mt-2 text-xs md:text-sm text-muted-foreground font-semibold">
          — Andrew Huberman - Stanford Neuroscientist
        </footer>
      </blockquote>

      <p className="text-2xl md:text-3xl font-black text-primary text-center mb-4">
        This is Why we want to send your Best Friend this Shirt with a Custom Message from You!
      </p>

      {/* Friend Shirt showcase with Custom Message Box embedded */}
      <FriendShirtSection delay={0.15} afterHeroSlot={<CustomMessageBox />} />

      <p className="text-2xl md:text-3xl font-black text-primary text-center mb-4">
        Claim your FREE Shirt + with Custom Message for Your Best Friend
      </p>

      <Button
        className="w-full max-w-lg mx-auto h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl mb-4"
      >
        Claim My FREE Custom Shirt Here
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      {/* Tony Robbins quote — moved after first CTA */}
      <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-4 shadow-soft">
        <p className="text-sm md:text-base italic text-foreground leading-relaxed">
          "Gratitude is the fastest & repeatable way to shift emotional state by changing physiology and perception. Make it a daily ritual."
        </p>
        <footer className="mt-2 text-xs md:text-sm text-muted-foreground font-semibold">
          — Tony Robbins
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
          "Most people live in survival emotions like fear, anger, guilt, shame"
        </p>
        <footer className="mt-2 text-xs md:text-sm text-muted-foreground font-semibold">
          — Dr Joe Dispenza
        </footer>
      </blockquote>
    </motion.div>
  );
};

export default GratitudeIntro;
