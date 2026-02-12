import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ImpactCta() {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <motion.div
        className="max-w-2xl mx-auto text-center bg-gradient-to-b from-primary/5 to-card border border-primary/10 rounded-2xl p-8 sm:p-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Be Part of <span className="text-primary">the Movement</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
          Every wristband shared feeds 11 people. Every pack multiplies your impact.
          Join 2,340+ people who've already made a difference.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Button
            size="lg"
            className="gap-2 btn-glow"
            onClick={() => navigate("/")}
          >
            Get Your FREE Wristband
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => navigate("/offer/111/grok")}
          >
            Bless a Friend for $111
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
