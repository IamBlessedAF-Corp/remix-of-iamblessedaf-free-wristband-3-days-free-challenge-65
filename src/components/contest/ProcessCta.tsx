import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

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
    <div className="text-center space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold leading-tight">
        Ready? Here's Your First Move.
      </h2>

      {/* Bullet structure — short, high-impact */}
      <div className="flex flex-col gap-2.5 max-w-xs mx-auto text-left">
        {[
          "Post 3 clips today",
          "Earn $2.22 minimum per clip",
          "Build toward your $111 unlock",
        ].map((line) => (
          <div key={line} className="flex items-start gap-2.5 text-sm text-foreground">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{line}</span>
          </div>
        ))}
      </div>

      {/* Primary CTA */}
      <div>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-13 px-10 text-base font-bold"
          onClick={onJoin}
        >
          Start My First Clip
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Takes less than 5 minutes to begin.
        </p>
      </div>

      {/* Momentum trigger */}
      <p className="text-sm text-muted-foreground">
        0 clips posted so far. Let's change that.
      </p>
    </div>
  </motion.section>
);

export default ProcessCta;
