import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ProcessCtaProps {
  onJoin: () => void;
}

const ProcessCta = ({ onJoin }: ProcessCtaProps) => (
  <motion.section
    className="px-4 py-14 max-w-3xl mx-auto"
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-3">
        Your Weekly System — Not a One-Off Gamble
      </h2>
      <p className="text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">
        Pick a clip from the vault → remix it your way → post it → get paid on views.
        Repeat every week. Stack views toward your bonus milestones.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 text-sm text-muted-foreground">
        <span className="bg-secondary rounded-full px-3 py-1">1. Browse vault</span>
        <span className="hidden sm:inline text-border">→</span>
        <span className="bg-secondary rounded-full px-3 py-1">2. Remix & post</span>
        <span className="hidden sm:inline text-border">→</span>
        <span className="bg-secondary rounded-full px-3 py-1">3. Submit link</span>
        <span className="hidden sm:inline text-border">→</span>
        <span className="bg-primary/10 text-primary font-semibold rounded-full px-3 py-1">4. Get paid</span>
      </div>

      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground h-13 px-8 text-base mt-2"
        onClick={onJoin}
      >
        Start Clipping — It's Free to Join
      </Button>

      <p className="text-xs text-muted-foreground mt-3">
        Questions? DM @JoeDaVincy — real person, real answers.
      </p>
    </div>
  </motion.section>
);

export default ProcessCta;
