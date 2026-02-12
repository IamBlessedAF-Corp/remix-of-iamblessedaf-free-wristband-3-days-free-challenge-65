import { motion } from "framer-motion";

const VALUES = [
  {
    emoji: "🧠",
    title: "Neural Pathway Activator",
    benefit: "Huberman-aligned protocol: received gratitude → mPFC → 27× serotonin surge",
    description:
      "Received gratitude triggers medial prefrontal cortex activation → serotonin + dopamine cascade. This pack automates that loop. Daily ROI: 27× baseline happiness.",
    value: "$210",
    sub: "Based on 8+ peer-reviewed studies · mPFC protocol",
  },
  {
    emoji: "⚡",
    title: "Identity Encoding System",
    benefit: "\"IamBlessedAF\" shirt = daily trigger for self-concept rewire",
    description:
      "Wear → get asked → explain gratitude → brain encodes identity. Each conversation = one neural pathway reinforcement cycle. Compound effect: 365 cycles/year.",
    value: "$45",
    sub: "Premium cotton · Double-sided print · S–3XL",
  },
  {
    emoji: "🎯",
    title: "Gratitude Deployment Unit",
    benefit: "Custom shirt for your target recipient — triggers THEIR mPFC → YOUR 27× dopamine hit",
    description:
      "They receive your message → feel gratitude → text you back. That response = your received gratitude trigger. Net result: bilateral brain rewire. Two brains, one shirt.",
    value: "$45",
    sub: "One-side custom print · Free shipping · Sizes S–3XL",
  },
  {
    emoji: "📊",
    title: "Micro-Dose Trigger Array",
    benefit: "3 wristbands = 50+ micro-gratitude activations/day at $0.02/trigger",
    description:
      "Glance → micro-gratitude → cortisol drop → repeat. 50×/day × 365 days = 18,250 neural activations/year. Cost per activation: $0.02. Best ROI in behavioral neuroscience.",
    value: "$33",
    sub: "Waterproof nylon · One-size-fits-all · Debossed trigger",
  },
  {
    emoji: "📈",
    title: "Impact Metric: 11 Meals Deployed",
    benefit: "Instant charitable impact — measurable mood elevation even on worst-case days",
    description:
      "Bad day scenario: you already deployed 11 meals before cortisol peaked. Measurable impact = measurable mood shift. No bad day survives verified altruism data.",
    value: "Priceless",
    sub: "Feeding America verified · Instant deployment",
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
        Precision Pack Breakdown — <span className="text-primary font-mono">$333+ Value</span>
      </p>
      <p className="text-center text-sm text-muted-foreground mb-4 font-mono">
        $111 ÷ 365 days = $0.30/day → 27× happiness ROI. System specs:
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
