import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const stack = [
  {
    item: "$2 Floor Payment Per Clip",
    value: "$2+",
    detail: "Every valid clip gets paid. 5k views or 50k—you start at $2 minimum.",
  },
  {
    item: "$0.22 RPM (per 1k views)",
    value: "$0.22/1k",
    detail: "7x higher than TikTok Creator Fund. Real RPM on real views.",
  },
  {
    item: "$22 Cap Per Clip",
    value: "Up to $22",
    detail: "100k+ views clip? You earn $22. Clean, transparent, no hidden math.",
  },
  {
    item: "FREE Wristband For Your Audience",
    value: "FREE",
    detail: "Every viewer who claims = 1 meal donated. Your content feeds people.",
  },
  {
    item: "$1,111 Grand Prize Drawing",
    value: "BONUS",
    detail: "Every clipper with a valid entry is entered into a $1,111 live drawing on @IamBlessedAF IG.",
  },
  {
    item: "Feature on @IamBlessedAF + @DaVincyGang",
    value: "EXPOSURE",
    detail: "Top clips get posted to 14k + 320k combined followers. Portfolio rocket fuel.",
  },
];

const ContestOfferStack = () => (
  <section className="px-4 py-12 max-w-4xl mx-auto">
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl font-bold mb-2">📦 The Offer Stack</h2>
      <p className="text-muted-foreground mb-8">
        Here's everything you get for making hoops × gratitude clips:
      </p>

      <div className="space-y-4">
        {stack.map((s, i) => (
          <motion.div
            key={i}
            className="bg-card rounded-lg p-5 border border-border/50 hover:border-primary/50 transition-all"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="text-lg font-bold">{s.item}</h3>
                  <span className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                    {s.value}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">{s.detail}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-secondary/40 rounded-xl p-6 border border-border/50 text-center">
        <p className="text-muted-foreground mb-1">Total value per active clipper:</p>
        <p className="text-3xl font-bold text-primary">$2–$22/clip + $1,111 drawing + exposure</p>
        <p className="text-sm text-muted-foreground mt-2">
          Your cost: $0. Your time: Clips you'd make anyway, with a gratitude twist.
        </p>
      </div>
    </motion.div>
  </section>
);

export default ContestOfferStack;
