import { motion } from "framer-motion";

const Grok4444HeroSection = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Benefit-driven headline */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        <span className="text-primary">$4,444</span> → Own a{" "}
        <span className="text-primary">Custom Leather Jacket</span>, Support Your Favorite Artist & Own the{" "}
        <span className="text-primary">NFT</span>
      </h1>

      {/* Epiphany Bridge */}
      <div className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto shadow-soft">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left">
          This isn't merch. This is{" "}
          <span className="font-bold text-foreground">
            wearable art meets patronage meets ownership.
          </span>{" "}
          Your favorite artist gets <span className="font-bold text-primary">77% of this payment</span> to create
          3 custom gratitude-themed pieces for the brand — and you get 1 of each.
        </p>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-left mt-3">
          Plus a{" "}
          <span className="font-bold text-foreground">
            custom leather jacket, the NFT of every piece,
          </span>{" "}
          and a <span className="font-bold text-primary">Gratitude Storyboard Canvas</span> — a one-of-a-kind artwork
          based on your personal gratitude story. This is legacy-level investment in art, impact, and identity.
        </p>
      </div>
    </motion.div>
  );
};

export default Grok4444HeroSection;
