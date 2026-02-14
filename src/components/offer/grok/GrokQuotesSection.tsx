import { motion } from "framer-motion";
import AuthorAvatar from "@/components/offer/AuthorAvatar";
import MpfcTooltip from "@/components/offer/MpfcTooltip";
import { ReactNode } from "react";

interface Quote {
  text: ReactNode;
  author: "huberman" | "tony-robbins" | "joe-dispenza";
}

const QUOTES: Quote[] = [
  {
    text: <>Received gratitude activates <MpfcTooltip /> circuits → serotonin + dopamine surge. This is the fastest documented neural rewire protocol.</>,
    author: "huberman",
  },
  {
    text: "Repetitive 'I Am' identity encoding with emotional charge → permanent self-concept modification. Measurable within 21 days.",
    author: "tony-robbins",
  },
  {
    text: "Frequency shift: shame (20Hz) → joy (540Hz). That's a 27× multiplier. Gratitude is the highest-ROI emotional input.",
    author: "joe-dispenza",
  },
];

const GrokQuotesSection = ({ delay = 0 }: { delay?: number }) => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <p className="text-center text-lg font-bold text-foreground mb-2">
        Clinical Evidence Base
      </p>

      {QUOTES.map((q, i) => (
        <div
          key={i}
          className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft"
        >
          <p className="text-sm italic text-foreground leading-relaxed font-mono">
            "{q.text}"
          </p>
          <footer className="mt-2">
            <AuthorAvatar author={q.author} />
          </footer>
        </div>
      ))}
    </motion.div>
  );
};

export default GrokQuotesSection;
