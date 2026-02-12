import { motion } from "framer-motion";

const GrokRiskReversal = ({ delay = 0 }: { delay?: number }) => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8 mt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <div className="border border-border/50 rounded-xl p-5 space-y-3 bg-card">
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="text-base flex-shrink-0">✅</span>
            <span>
              <span className="font-bold">Not Feeling Grateful Today?</span>{" "}
              <span className="text-muted-foreground">
                Only in America, 14 million children are facing hunger. Your purchase feeds 11 of them — in honor of Andrew Huberman's discoveries in the Neuroscience of Gratitude — through Tony Robbins' "1 Billion Meals Challenge".
              </span>
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="text-base flex-shrink-0">✅</span>
            <span>
              <span className="font-bold">Secure 256-bit SSL</span>{" "}
              <span className="text-muted-foreground">
                — No subs, hidden fees.
              </span>
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="text-base flex-shrink-0">✅</span>
            <span>
              <span className="font-bold">Free US Shipping</span>{" "}
              <span className="text-muted-foreground">· International Flat Rate · 7–14 days.</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GrokRiskReversal;
