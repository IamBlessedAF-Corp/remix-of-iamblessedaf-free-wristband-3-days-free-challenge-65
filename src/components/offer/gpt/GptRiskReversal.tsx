import { motion } from "framer-motion";

const GptRiskReversal = ({ delay = 0 }: { delay?: number }) => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8 mt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <div className="border border-border/50 rounded-xl p-5 space-y-3 bg-card">
        <p className="text-center text-sm font-bold text-foreground mb-2">
          Our Promise to You 💛
        </p>
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="text-base flex-shrink-0">💛</span>
            <span>
              <span className="font-bold">30-Day Happiness Promise:</span>{" "}
              <span className="text-muted-foreground">
                Send 3 gratitude texts, wear the shirt for 3 days. If you don't feel the shift — full refund. Keep the donated meals as our gift.
              </span>
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="text-base flex-shrink-0">🔒</span>
            <span>
              <span className="font-bold">100% Secure</span>{" "}
              <span className="text-muted-foreground">
                — 256-bit encrypted. No subscriptions, ever.
              </span>
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="text-base flex-shrink-0">🌍</span>
            <span>
              <span className="font-bold">Free US Shipping</span>{" "}
              <span className="text-muted-foreground">· International Flat Rate · Ships with love in 7–14 days.</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GptRiskReversal;
