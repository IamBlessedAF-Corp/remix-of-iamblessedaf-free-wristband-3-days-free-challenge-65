import { motion } from "framer-motion";

/**
 * Brunson Epiphany Bridge storytelling section.
 * Places between GratitudeIntro (Hero) and ProductSections (Value Stack).
 * Uses conversational, letter-style typography for emotional resonance.
 */
const EpiphanyBridge = () => {
  return (
    <motion.section
      className="py-10 mb-8"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-lg mx-auto space-y-6">
        {/* The Struggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3 text-center">
            Be honest...
          </p>
          <p className="text-base md:text-lg text-foreground leading-relaxed font-serif italic">
            You have 500 friends online. But when's the last time someone looked you in the eye and said{" "}
            <span className="font-bold text-primary not-italic">"You changed my life"</span>?
          </p>
        </motion.div>

        {/* The Epiphany */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-base md:text-lg text-foreground leading-relaxed font-serif italic">
            Now picture this: your best friend opens a package. Inside is a shirt with{" "}
            <span className="font-bold text-primary not-italic">YOUR words</span> on it.
            A real message about a real moment between you two.
          </p>
        </motion.div>

        {/* The Vision */}
        <motion.div
          className="bg-card border border-border/50 rounded-2xl p-5 shadow-soft"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-base md:text-lg text-foreground leading-relaxed font-serif italic">
            They read it. Eyes water. They call you:{" "}
            <span className="font-bold text-primary not-italic">"I can't believe you remembered that."</span>
          </p>
          <p className="text-base md:text-lg text-foreground leading-relaxed font-serif italic mt-3">
            THAT feeling — not a like, not a heart emoji — a{" "}
            <span className="not-italic font-bold">real human being</span> feeling grateful for{" "}
            <span className="font-bold text-primary not-italic">you</span>. That's when your brain floods with
            dopamine and serotonin. The Harvard Grant Study calls it the #1 predictor of lifelong happiness.
          </p>
        </motion.div>

        {/* The Reveal */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-lg md:text-xl font-bold text-foreground">
            This pack makes that moment happen.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            A real gift. A real message. A real relationship — deepened forever.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default EpiphanyBridge;
