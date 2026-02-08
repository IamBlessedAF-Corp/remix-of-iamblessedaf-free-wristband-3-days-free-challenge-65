import { motion } from "framer-motion";

const VALUES = [
  {
    emoji: "🖤",
    title: "7× Black 'Brain Hack' Shirts — Value: $315",
    description:
      "One for every day of the week. Never break the gratitude chain. $1,111 ÷ 365 = $3.04/day to rewire your identity permanently.",
    sub: "Premium cotton · Double-sided print · Sizes S–3XL",
  },
  {
    emoji: "🤍",
    title: "11× Custom White Friend Shirts — Value: $495",
    description:
      "Your personal message on 11 shirts for 11 people who matter most. Parents. Siblings. Best friends. Mentors. Each text back = a 27× dopamine hit.",
    sub: "One-side custom print · Sizes S–3XL · Unique message on each",
  },
  {
    emoji: "📿",
    title: "111× Trigger Wristbands — Value: $1,221",
    description:
      "111 bands to give away everywhere — family reunions, the office, your gym, church, school. Turn your entire circle into a gratitude network.",
    sub: "Silicone · One-size-fits-all · IamBlessedAF debossed",
  },
  {
    emoji: "❤️",
    title: "11,111 Meals Donated — Value: Priceless",
    description:
      "Not 11. Not 1,111. Eleven thousand one hundred eleven meals. That's a small town fed — because of you. No bad day survives that legacy.",
    sub: "Backed by Feeding America",
  },
  {
    emoji: "🧠",
    title: "Full Kingdom Ambassador Protocol — Value: $2,222+",
    description:
      "7-day identity loop + 11-person gratitude cascade + 111 micro-triggers in your community. Huberman's research x maximum surface area. You pay 50% off.",
    sub: "Based on 8+ peer-reviewed studies",
  },
];

const Grok1111ValueStack = () => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <p className="text-center text-xl md:text-2xl font-bold text-foreground mb-1">
        Your $1,111 Pack — <span className="text-primary">$2,222+ Value</span>
      </p>
      <p className="text-center text-sm text-muted-foreground mb-4">
        $3.04/day to become a Kingdom Ambassador & feed 11,111 people. That's the math.
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

export default Grok1111ValueStack;
