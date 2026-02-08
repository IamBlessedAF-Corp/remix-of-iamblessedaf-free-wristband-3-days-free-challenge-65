import { motion } from "framer-motion";

const VALUES = [
  {
    emoji: "🧥",
    title: "Custom Leather Jacket — Value: $1,500+",
    description:
      "Handcrafted premium leather with IamBlessedAF detailing. A wearable statement that turns heads and starts conversations about gratitude.",
    sub: "Genuine leather · Custom fit · Limited edition",
  },
  {
    emoji: "🎨",
    title: "Support Your Favorite Artist — 77% Goes to Them",
    description:
      "Choose an artist you believe in. They receive $3,422 directly to create 3 custom gratitude-themed pieces for the brand. You're a patron of art and impact.",
    sub: "Artist gets 77% · 3 custom creations · Direct support",
  },
  {
    emoji: "🖼️",
    title: "1 of Each Custom Art Piece — Value: $2,000+",
    description:
      "The artist creates 3 original pieces. You receive 1 of each — exclusive collector editions that no one else on earth will own.",
    sub: "3 original works · Signed by artist · Certificate of authenticity",
  },
  {
    emoji: "💎",
    title: "NFT Ownership of Every Piece — Value: $1,000+",
    description:
      "Own the digital provenance. Each artwork is minted as an NFT — you hold the on-chain proof of authenticity and ownership forever.",
    sub: "Blockchain-verified · Transferable · Permanent record",
  },
  {
    emoji: "🎭",
    title: "Gratitude Storyboard Canvas — Value: Priceless",
    description:
      "A one-of-a-kind canvas artwork based on YOUR personal gratitude story — why this person makes you feel blessed, woven into a visual storyboard narrative.",
    sub: "Custom commission · Gallery-quality canvas · Your story, immortalized",
  },
  {
    emoji: "❤️",
    title: "44,444 Meals Donated — Value: Priceless",
    description:
      "The ultimate legacy move. Forty-four thousand meals donated in your name. That's not a purchase — that's a chapter in someone's survival story.",
    sub: "Backed by Feeding America",
  },
];

const Grok4444ValueStack = () => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <p className="text-center text-xl md:text-2xl font-bold text-foreground mb-1">
        Your $4,444 Pack — <span className="text-primary">$6,000+ Value</span>
      </p>
      <p className="text-center text-sm text-muted-foreground mb-4">
        Art. Ownership. Impact. Legacy. This is the apex tier.
      </p>

      {VALUES.map((item, i) => (
        <motion.div
          key={i}
          className="bg-card border border-border/50 rounded-xl p-4 shadow-soft"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.08 }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm md:text-base font-bold text-foreground leading-snug">
                {item.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                {item.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                {item.sub}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Grok4444ValueStack;
