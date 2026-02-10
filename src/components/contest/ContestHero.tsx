import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface ContestHeroProps {
  logo: string;
  onJoin: () => void;
}

const ContestHero = ({ logo, onJoin }: ContestHeroProps) => (
  <section className="px-4 pt-10 pb-6 max-w-3xl mx-auto">
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src={logo}
        alt="I am Blessed AF"
        className="w-full max-w-[200px] h-auto object-contain mx-auto mb-6"
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-tight">
        Clip Gratitude Content.<br />
        Get Paid Per View. Every Week.
      </h1>

      <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
        $0.22 per 1,000 views. $2.22 minimum per clip — even at 1,000 views.
        No follower requirements. No approval process.
      </p>

      <div className="flex flex-col gap-2 max-w-sm mx-auto mb-6 text-left">
        {[
          "Guaranteed pay per clip — not per month",
          "Works at 1k views — no viral needed",
          "Weekly payouts — not 'when we feel like it'",
        ].map((line) => (
          <div key={line} className="flex items-start gap-2.5 text-sm text-foreground">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{line}</span>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground h-13 px-8 text-base"
        onClick={onJoin}
      >
        Start Clipping — See How It Works
      </Button>

      <p className="text-xs text-muted-foreground mt-3">
        Free to join · No credit card · Submit your first clip today
      </p>
    </motion.div>
  </section>
);

export default ContestHero;
