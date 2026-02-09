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
            Picture this...
          </p>
          <p className="text-base md:text-lg text-foreground leading-relaxed font-serif italic">
            You're scrolling through your phone at midnight. Hundreds of messages, notifications, likes — 
            yet something feels <span className="font-bold text-primary not-italic">hollow</span>.
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
            Then one morning, your best friend opens a package. Inside is a shirt with 
            <span className="font-bold text-primary not-italic"> your words </span> on it — a real message, 
            from you, about a moment that <span className="not-italic font-bold">actually mattered</span>.
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
            They read it. Their eyes water. They text you:{" "}
            <span className="font-bold text-primary not-italic">"I can't believe you remembered that."</span>
          </p>
          <p className="text-base md:text-lg text-foreground leading-relaxed font-serif italic mt-3">
            That shift — from digital noise to <span className="not-italic font-bold">real human connection</span> — 
            that's the moment your brain floods with dopamine and serotonin. Not from an app. From a{" "}
            <span className="font-bold text-primary not-italic">real person</span> receiving{" "}
            <span className="font-bold text-primary not-italic">real gratitude</span>.
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
            That's what this pack does.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            A physical pattern interrupt that triggers the most powerful neurochemical cocktail nature designed.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default EpiphanyBridge;
