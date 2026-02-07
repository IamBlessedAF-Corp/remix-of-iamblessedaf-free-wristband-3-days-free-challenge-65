import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface GptStickyBarProps {
  onCheckout: () => void;
}

const GptStickyBar = ({ onCheckout }: GptStickyBarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past ~400px
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/60 px-4 py-3 safe-bottom"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      exit={{ y: 80 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <div className="flex-shrink-0">
          <p className="text-lg font-bold text-foreground">$111</p>
          <p className="text-xs text-primary font-semibold">67% OFF</p>
        </div>
        <Button
          onClick={() => {
            onCheckout();
            window.dispatchEvent(new CustomEvent("track", { detail: { event: "upsell2_accept", source: "sticky_bar" } }));
          }}
          className="flex-1 h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl btn-glow animate-pulse-glow"
        >
          Add to My Order
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

export default GptStickyBar;
