import { motion } from "framer-motion";

const VALUES = [
  {
    emoji: "💎",
    title: "Your \"IamBlessedAF\" Identity Shirt",
    description:
      "Wear it → people ask about it → you explain gratitude → brain rewire activates. Value: $45",
    sub: "Premium cotton · Double-sided print · S–3XL",
  },
  {
    emoji: "🎁",
    title: "FREE Custom Shirt for Your Best Friend",
    description:
      "Your personal message printed on a shirt. They wear it, feel it, text you back. That text = your 27× dopamine hit. Value: $45",
    sub: "One-side custom print · Free shipping",
  },
  {
    emoji: "📿",
    title: "3 Gratitude Trigger Wristbands",
    description:
      "Glance at wrist → micro-gratitude moment → repeat 50×/day. Cost per hack: $0.02. Value: $33",
    sub: "NFC-enabled · Waterproof silicone",
  },
  {
    emoji: "❤️",
    title: "11 Meals Donated Instantly",
    description:
      "Bad day? You already fed 11 people before breakfast. That's not a purchase — that's a legacy. Value: Priceless",
    sub: "Backed by Feeding America",
  },
  {
    emoji: "🧠",
    title: "Neuroscience-Backed Brain Rewire",
    description:
      "Huberman protocol: received gratitude → mPFC activation → serotonin + dopamine surge. ROI: 27× happier.",
    sub: "Based on 8+ peer-reviewed studies",
  },
];

const GrokValueStack = () => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <p className="text-center text-xl md:text-2xl font-bold text-foreground mb-1">
        Your $111 Pack — <span className="text-primary">$333+ Value</span>
      </p>
      <p className="text-center text-sm text-muted-foreground mb-4">
        That's $0.30/day to feel 27× happier for a full year.
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

export default GrokValueStack;
