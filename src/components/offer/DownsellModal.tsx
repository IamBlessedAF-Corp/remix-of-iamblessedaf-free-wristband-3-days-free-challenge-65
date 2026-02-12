import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Repeat, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

interface DownsellModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onShown?: () => void;
  onTrack?: (event: "shown" | "accepted" | "declined" | "closed") => void;
}

const DownsellModal = ({ open, onClose, onAccept, onDecline, onTrack }: DownsellModalProps) => {
  // Track shown event when modal opens
  const shownRef = React.useRef(false);
  React.useEffect(() => {
    if (open && !shownRef.current) {
      shownRef.current = true;
      onTrack?.("shown");
    }
    if (!open) shownRef.current = false;
  }, [open, onTrack]);

  const handleClose = () => {
    onTrack?.("closed");
    onClose();
  };
  const handleAccept = () => {
    onTrack?.("accepted");
    onAccept();
  };
  const handleDecline = () => {
    onTrack?.("declined");
    onDecline();
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-background w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-b from-primary/10 to-transparent pt-8 pb-4 px-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
                  Wait — before you go...
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                  Not ready for the full pack?<br />
                  Try <span className="text-primary">$11/mo</span> instead.
                </h2>
              </motion.div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Keep the brain rewire going for less than a coffee/day. Cancel anytime — no commitment.
              </p>

              {/* Price */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">$11</span>
                  <span className="text-lg text-muted-foreground">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  That's $0.36/day — ROI: 27× happier, every single day.
                </p>
              </div>

              {/* Quick benefits */}
              <div className="space-y-2">
                {[
                  "Premium daily gratitude prompts",
                  "Private community of blessing champions",
                  "Early access to drops & challenges",
                  "Monthly exclusive challenges with prizes",
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2.5 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={handleAccept}
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow transition-all duration-300 rounded-xl"
              >
                <Repeat className="w-5 h-5 mr-2" />
                Yes! Lock In $11/mo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-primary" />
                  Cancel anytime
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Instant access
                </span>
              </div>

              {/* Final decline */}
              <button
                onClick={handleDecline}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                No thanks, I'll pass on everything →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DownsellModal;
