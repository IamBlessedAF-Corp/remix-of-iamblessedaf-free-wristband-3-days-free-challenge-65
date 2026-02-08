import { motion } from "framer-motion";
import AuthorAvatar from "@/components/offer/AuthorAvatar";

const QUOTES = [
  {
    text: "The most potent form of gratitude isn't giving thanks — it's receiving genuine appreciation. That's where the brain truly transforms.",
    author: "huberman" as const,
  },
  {
    text: "Whatever you consistently attach to 'I Am' with strong emotion — you will eventually become.",
    author: "tony-robbins" as const,
  },
  {
    text: "When you feel gratitude, your body believes it's already receiving the blessing — and begins creating it.",
    author: "joe-dispenza" as const,
  },
];

const GptQuotesSection = ({ delay = 0 }: { delay?: number }) => {
  return (
    <motion.div
      className="max-w-lg mx-auto mb-8 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <p className="text-center text-lg font-bold text-foreground mb-2">
        Words That Changed Everything ✨
      </p>

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

export default GptQuotesSection;
