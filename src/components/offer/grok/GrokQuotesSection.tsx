import { motion } from "framer-motion";
import AuthorAvatar from "@/components/offer/AuthorAvatar";

const QUOTES = [
  {
    text: "Gratitude skyrockets dopamine & serotonin — the fastest emotional shift.",
    author: "huberman" as const,
  },
  {
    text: "Attach emotion to 'I Am' — become it.",
    author: "tony-robbins" as const,
  },
  {
    text: "Gratitude jumps you from shame (20Hz) to joy (540Hz) — 27x happier!",
    author: "joe-dispenza" as const,
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
      {QUOTES.map((q, i) => (
        <div
          key={i}
          className="bg-card border border-border/50 rounded-2xl p-4 shadow-soft"
        >
          <p className="text-sm italic text-foreground leading-relaxed">
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
