import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Gift, X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Prize {
  id: string;
  name: string;
  emoji: string;
  description: string;
  weight: number;
}

const PRIZES: Prize[] = [
  { id: "bc-25", name: "+25 Blessed Coins", emoji: "🪙", description: "Added to your wallet!", weight: 40 },
  { id: "hearts-10", name: "+10 Hearts", emoji: "💝", description: "Impact score boosted!", weight: 25 },
  { id: "wristband", name: "Extra FREE Wristband", emoji: "📿", description: "Added to your order!", weight: 15 },
  { id: "discount-15", name: "15% OFF Next Purchase", emoji: "🏷️", description: "Code: BLESSED15", weight: 10 },
  { id: "golden-ticket", name: "Golden Ticket!", emoji: "🎫", description: "Free tier upgrade!", weight: 5 },
  { id: "double-hearts", name: "2× Hearts for 24hrs", emoji: "⚡", description: "Double impact activated!", weight: 5 },
];

function pickPrize(): Prize {
  const totalWeight = PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  for (const prize of PRIZES) {
    random -= prize.weight;
    if (random <= 0) return prize;
  }
  return PRIZES[0];
}

const STORAGE_KEY = "mystery-box-opened";

interface MysteryBoxProps {
  show: boolean;
  onClose: () => void;
}

export default function MysteryBox({ show, onClose }: MysteryBoxProps) {
  const [phase, setPhase] = useState<"closed" | "shaking" | "opened">("closed");
  const [prize, setPrize] = useState<Prize | null>(null);

  const alreadyOpened = localStorage.getItem(STORAGE_KEY) === "true";

  const handleTap = useCallback(() => {
    if (phase !== "closed") return;
    setPhase("shaking");

    setTimeout(() => {
      const won = pickPrize();
      setPrize(won);
      setPhase("opened");
      localStorage.setItem(STORAGE_KEY, "true");

      // Triple confetti burst
      const fire = (opts: confetti.Options) =>
        confetti({ ...opts, disableForReducedMotion: true });

      fire({ particleCount: 80, spread: 100, origin: { y: 0.6 } });
      setTimeout(() => fire({ particleCount: 40, angle: 60, spread: 60, origin: { x: 0, y: 0.6 } }), 200);
      setTimeout(() => fire({ particleCount: 40, angle: 120, spread: 60, origin: { x: 1, y: 0.6 } }), 400);
    }, 1200);
  }, [phase]);

  if (!show || alreadyOpened) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/60 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Box / Prize */}
        <div className="relative z-10 flex flex-col items-center">
          {phase === "closed" && (
            <motion.div
              className="flex flex-col items-center gap-4 cursor-pointer"
              onClick={handleTap}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-32 h-32 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/40 border-2 border-amber-300/50"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(245,158,11,0.4)",
                    "0 0 40px rgba(245,158,11,0.6)",
                    "0 0 20px rgba(245,158,11,0.4)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Gift className="w-16 h-16 text-white" />
              </motion.div>
              <motion.p
                className="text-white font-bold text-lg"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨ Tap to Open ✨
              </motion.p>
              <p className="text-white/60 text-sm">You earned a Mystery Reward!</p>
            </motion.div>
          )}

          {phase === "shaking" && (
            <motion.div
              className="w-32 h-32 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl border-2 border-amber-300/50"
              animate={{
                rotate: [-5, 5, -5, 5, -3, 3, -2, 2, 0],
                scale: [1, 1.05, 1, 1.05, 1, 1.02, 1, 1.01, 1.2],
              }}
              transition={{ duration: 1.2 }}
            >
              <Gift className="w-16 h-16 text-white" />
            </motion.div>
          )}

          {phase === "opened" && prize && (
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
            >
              <motion.span
                className="text-7xl"
                initial={{ rotateY: -180, scale: 0 }}
                animate={{ rotateY: 0, scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                {prize.emoji}
              </motion.span>
              <h3 className="text-2xl font-black text-white">{prize.name}</h3>
              <p className="text-white/70 text-sm">{prize.description}</p>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={onClose}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                >
                  Claim Reward 🎉
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "I won a mystery prize!",
                        text: `I just won ${prize.name} on IamBlessedAF! 🎉 #IamBlessedAF`,
                        url: window.location.origin,
                      }).catch(() => {});
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
