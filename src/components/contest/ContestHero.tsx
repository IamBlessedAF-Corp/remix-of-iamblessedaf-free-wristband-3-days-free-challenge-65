import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ContestHeroProps {
  logo: string;
  onJoin: () => void;
}

const ContestHero = ({ logo, onJoin }: ContestHeroProps) => (
  <section className="px-4 pt-12 pb-8 max-w-4xl mx-auto">
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <img
        src={logo}
        alt="I am Blessed AF"
        className="w-full max-w-xs h-auto object-contain mx-auto mb-8"
      />

      <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
        Gratitude Clippers: Get Paid<br /><span className="text-primary">$2.22–$1,111</span> Per Clip. Period.
      </h1>

      <p className="text-xl text-muted-foreground mb-3 max-w-2xl mx-auto">
        Remix gratitude & neuroscience clips → <strong>$2.22 guaranteed per clip</strong> (even at 1,000 views) → $0.22/1k RPM → $22 cap.<br />
        That's <strong>7x TikTok Creator Fund</strong>. No gatekeeping.
      </p>

      <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-5 py-2 mb-4">
        <span className="text-primary font-bold text-lg">🧠 Gratitude × Neuroscience = Cash</span>
      </div>

      <p className="text-muted-foreground mb-6">
        $1,111 payout pool • + Bonus $1,111 grand prize drawing every Friday
      </p>

      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-10 text-lg"
        onClick={onJoin}
      >
        Claim My Clipper Spot →
      </Button>
    </motion.div>
  </section>
);

export default ContestHero;
