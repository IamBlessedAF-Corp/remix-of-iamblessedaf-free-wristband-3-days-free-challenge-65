import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface StickyCtaBarProps {
  onCheckout: () => void;
  loading?: boolean;
  price: string;
  discount: string;
  label?: string;
  trackingSource?: string;
  /** CSS selector for the element that must be scrolled past before showing the bar */
  triggerSelector?: string;
}

const StickyCtaBar = ({
  onCheckout,
  loading = false,
  price,
  discount,
  label = "Add to My Order",
  trackingSource = "sticky_bar",
  triggerSelector,
}: StickyCtaBarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (triggerSelector) {
      // Use IntersectionObserver: show bar only after trigger element has been scrolled past
      const el = document.querySelector(triggerSelector);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          // Show when the trigger element is above the viewport (scrolled past)
          setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        },
        { threshold: 0 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }
    // Fallback: show after scrolling 600px
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [triggerSelector]);

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
          <p className="text-lg font-bold text-foreground">{price}</p>
          <p className="text-xs text-primary font-semibold">{discount}</p>
        </div>
        <Button
          onClick={() => {
            onCheckout();
            window.dispatchEvent(
              new CustomEvent("track", {
                detail: { event: "sticky_cta_click", source: trackingSource },
              })
            );
          }}
          disabled={loading}
          className="flex-1 h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl btn-glow animate-pulse-glow disabled:opacity-70 disabled:animate-none"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {loading ? "Processing…" : label}
          {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </motion.div>
  );
};

export default StickyCtaBar;
