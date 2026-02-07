import { motion } from "framer-motion";

const GrokViralFooter = ({ delay = 0 }: { delay?: number }) => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <div className="bg-card border border-border/50 rounded-xl p-5 max-w-lg mx-auto shadow-soft mb-4">
        <p className="text-sm font-semibold text-foreground mb-2">
          📲 Share your custom message with{" "}
          <span className="text-primary">#IamBlessedAF</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Tag us for a feature & bonus hearts!
        </p>
      </div>

      <a
        href="/challenge/thanks"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Maybe later? → (We'll send a reminder email)
      </a>
    </motion.div>
  );
};

export default GrokViralFooter;
