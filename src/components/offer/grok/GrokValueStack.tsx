import { motion } from "framer-motion";

const VALUES = [
  {
    emoji: "💎",
    title: "Instant Identity Boost",
    description:
      'Your personal "IamBlessedAF" shirt + wristbands — wear your gratitude, spark conversations, feel the rewire daily.',
    sub: "Premium cotton · Double-sided print",
  },
  {
    emoji: "🎁",
    title: "Gift the Magic",
    description:
      'Custom shirt for your best friend with your message ("IamBlessedAF to have U") — they scan QR, join challenge, double the impact.',
    sub: "One-side print · Sizes S–3XL",
  },
  {
    emoji: "❤️",
    title: "Real Impact Now",
    description:
      "11 meals donated immediately — turn tough days into life-changing good.",
    sub: "Backed by Feeding America",
  },
  {
    emoji: "🧠",
    title: "Brain Hack Included",
    description:
      "Aligns with Huberman's protocol — stronger pro-social circuits, less stress.",
    sub: "mPFC activation + serotonin surge",
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
      <p className="text-center text-xl md:text-2xl font-bold text-foreground mb-4">
        What You Get <span className="text-primary">Today</span>
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
