import { motion } from "framer-motion";

const VALUES = [
  {
    emoji: "💎",
    title: "Instant Identity Boost",
    benefit: "Wear your gratitude, spark conversations, feel the rewire daily",
    description:
      "Your personal \"IamBlessedAF\" shirt + wristbands — people ask about it → you explain gratitude → brain rewire activates.",
    value: "$45",
    sub: "Premium cotton · Double-sided print · S–3XL",
  },
  {
    emoji: "🎁",
    title: "Gift the Magic",
    benefit: "Custom shirt for your best friend with YOUR message — they scan QR, join the challenge, double the impact",
    description:
      "They wear it, feel it, text you back. That text = your 27× dopamine hit. Imagine their face opening this.",
    value: "$45",
    sub: "One-side custom print · Free shipping · Sizes S–3XL",
  },
  {
    emoji: "❤️",
    title: "Real Impact Now",
    benefit: "11 meals donated immediately — turn tough days into life-changing good",
    description:
      "Bad day? You already fed 11 people before breakfast. That's not a purchase — that's a legacy. No bad day survives that.",
    value: "Priceless",
    sub: "Backed by Feeding America",
  },
  {
    emoji: "📿",
    title: "Daily Trigger System",
    benefit: "3 wristbands = 50+ micro-gratitude moments per day",
    description:
      "Glance at wrist → micro-gratitude moment → repeat. Cost per hack: $0.02. Give extras away to start gratitude convos.",
    value: "$33",
    sub: "NFC-enabled · Waterproof silicone · IamBlessedAF debossed",
  },
  {
    emoji: "🧠",
    title: "Brain Hack Included",
    benefit: "Aligns with Huberman's protocol — stronger pro-social circuits, less stress",
    description:
      "Received gratitude → mPFC activation → serotonin + dopamine surge. This pack triggers that loop daily. ROI: 27× happier.",
    value: "$210",
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
        That's $0.30/day to feel 27× happier for a full year. Here's what's inside:
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
              <p className="text-sm font-semibold text-primary leading-snug mt-0.5">
                {item.benefit}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                {item.description}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {item.sub}
                </p>
                <span className="text-xs font-bold text-foreground">Value: {item.value}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default GrokValueStack;
