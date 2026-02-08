import { motion } from "framer-motion";

const VALUES = [
  {
    emoji: "💌",
    title: "A Gift That Makes Them Cry (Happy Tears)",
    benefit: "Custom shirt with YOUR handwritten message — imagine their face when they read it",
    description:
      "This isn't merch. It's a love letter printed on cotton. They'll wear your words close to their heart — and text you back something you'll screenshot forever.",
    sub: "One-side custom print · Free shipping · Sizes S–3XL",
  },
  {
    emoji: "✨",
    title: "Wear Your Identity, Not Just a Shirt",
    benefit: "Your own \"IamBlessedAF\" shirt — a daily reminder of who you really are",
    description:
      "Every time you put it on, you choose gratitude. People ask about it. You share your story. And suddenly a random Tuesday becomes meaningful.",
    sub: "Premium cotton · Double-sided print · S–3XL",
  },
  {
    emoji: "🌊",
    title: "Turn Your Worst Day into Someone's Best",
    benefit: "11 meals donated instantly — bad day? You already changed 11 lives before lunch",
    description:
      "There's no bad day that survives knowing you fed 11 people. That warmth in your chest? That's gratitude doing what it was designed to do.",
    sub: "Backed by Feeding America",
  },
  {
    emoji: "📿",
    title: "Tiny Reminders, Big Shifts",
    benefit: "3 wristbands that whisper \"you're blessed\" 50+ times a day",
    description:
      "Glance at your wrist during a stressful meeting, a tough commute, a lonely moment — and remember: you are blessed. Give the extras to people who need that reminder too.",
    sub: "Waterproof silicone · IamBlessedAF debossed",
  },
  {
    emoji: "🎨",
    title: "Your Creative Gratitude Legacy",
    benefit: "Co-designed with a PhD neuroscientist — 7+ years of research behind every detail",
    description:
      "This isn't random merch. Every word, every design choice is crafted to trigger the gratitude circuits in your brain. You're not buying a product — you're starting a movement.",
    sub: "Based on 8+ peer-reviewed studies",
  },
];

const GptValueStack = () => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <p className="text-center text-xl md:text-2xl font-bold text-foreground mb-1">
        What's Inside Your <span className="text-primary">Gratitude Pack</span>
      </p>
      <p className="text-center text-sm text-muted-foreground mb-4">
        Everything you need to make gratitude something you <em>feel</em>, not just think about.
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                {item.sub}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default GptValueStack;
