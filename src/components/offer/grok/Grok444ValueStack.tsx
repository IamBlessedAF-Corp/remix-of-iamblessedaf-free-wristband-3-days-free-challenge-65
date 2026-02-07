import { motion } from "framer-motion";

const VALUES = [
  {
    emoji: "🖤",
    title: "5× Black 'Brain Hack' Shirts",
    description:
      "One for every weekday. Wear your IamBlessedAF identity daily — sparking gratitude convos every time someone reads it.",
    sub: "Premium cotton · Double-sided print · Sizes S–3XL",
  },
  {
    emoji: "🎁",
    title: "3× White Custom Friend Shirts",
    description:
      'Your personal message on 3 shirts for 3 friends. They scan the QR, join the challenge, and the ripple effect multiplies.',
    sub: "One-side print · Sizes S–3XL · Custom message on each",
  },
  {
    emoji: "📿",
    title: "14× Trigger Wristbands",
    description:
      "Wear them. Give them away. Each band is a micro-reminder that hacks gratitude into every handshake, meeting, and moment.",
    sub: "Silicone · One-size-fits-all · IamBlessedAF debossed",
  },
  {
    emoji: "❤️",
    title: "1,111 Meals Donated Instantly",
    description:
      "Turn your worst day into 1,111 people's best meal. That's not a purchase — it's a legacy move.",
    sub: "Backed by Feeding America",
  },
  {
    emoji: "🧠",
    title: "Full Brain Hack Protocol",
    description:
      "Aligned with Huberman's gratitude protocol. 5 shirts + 14 bands = daily mPFC activation, serotonin surge, and stress obliteration.",
    sub: "mPFC activation · Dopamine + Serotonin boost",
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

export default Grok444ValueStack;
