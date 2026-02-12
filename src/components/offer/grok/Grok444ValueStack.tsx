import { motion } from "framer-motion";

const VALUES = [
  {
    emoji: "🖤",
    title: "5× Black 'Brain Hack' Shirts — Value: $225",
    description:
      "One for every weekday. $444 ÷ 365 = $1.22/day to feel 27× happier. That's the ROI of a daily identity shift.",
    sub: "Premium cotton · Double-sided print · Sizes S–3XL",
  },
  {
    emoji: "🎁",
    title: "3× Custom Friend Shirts — Value: $135",
    description:
      "Your message on 3 shirts for 3 people. They read it → text you back → that text triggers your 27× dopamine hit. Multiply the loop.",
    sub: "One-side print · Sizes S–3XL · Custom message on each",
  },
  {
    emoji: "📿",
    title: "14× Trigger Wristbands — Value: $154",
    description:
      "14 bands = 14 daily micro-reminders. Give them away, start convos, hack gratitude into every interaction. Cost per hack: $0.01.",
    sub: "Waterproof nylon · One-size-fits-all · IamBlessedAF debossed",
  },
  {
    emoji: "❤️",
    title: "1,111 Meals Donated — Value: Priceless",
    description:
      "Worst day ever? You already fed 1,111 people. That's not a purchase — that's a legacy move no bad day can erase.",
    sub: "Backed by Feeding America",
  },
  {
    emoji: "🧠",
    title: "Full Brain Hack Protocol — Value: $333",
    description:
      "Huberman's research: 5 shirts + 14 bands = daily mPFC activation. Total value: $888+. You pay $444 — 50% off.",
    sub: "Based on 8+ peer-reviewed studies",
  },
];

const Grok444ValueStack = () => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <p className="text-center text-xl md:text-2xl font-bold text-foreground mb-1">
        Your $444 Pack — <span className="text-primary">$888+ Value</span>
      </p>
      <p className="text-center text-sm text-muted-foreground mb-4">
        $1.22/day to rewire your brain & feed 1,111 people. That's the math.
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

export default Grok444ValueStack;
