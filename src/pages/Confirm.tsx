import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Confirm = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Placeholder blessing count - will be dynamic
  const blessingCount = 12847;

  const handleConfirm = async () => {
    setIsAnimating(true);
    
    // Placeholder for GoHighLevel webhook trigger
    console.log("Blessing confirmed - triggering webhook");
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setIsConfirmed(true);
    setIsAnimating(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <motion.img
          src={logo}
          alt="I am Blessed AF"
          className="w-full h-auto object-contain mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        <AnimatePresence mode="wait">
          {!isConfirmed ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Context */}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Someone blessed you! 💫
              </h1>
              <p className="text-muted-foreground mb-8">
                Tap below to confirm you received their gratitude message.
              </p>

              {/* Confirm Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleConfirm}
                  disabled={isAnimating}
                  className="w-full h-20 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl btn-glow transition-all duration-300"
                >
                  {isAnimating ? (
                    <span className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                      Confirming...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6" />
                      Confirm Blessing ✅
                    </span>
                  )}
                </Button>
              </motion.div>

              {/* Counter */}
              <motion.div
                className="mt-8 flex items-center justify-center gap-2 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Heart className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-sm">
                  <strong className="text-foreground">{blessingCount.toLocaleString()}</strong> blessings confirmed worldwide
                </span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
              className="relative"
            >
              {/* Celebration particles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    backgroundColor: i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos((i * 30 * Math.PI) / 180) * 100,
                    y: Math.sin((i * 30 * Math.PI) / 180) * 100,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                />
              ))}

              {/* Success icon */}
              <motion.div
                className="mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-primary rounded-full p-6 inline-block shadow-glow">
                  <Heart className="w-12 h-12 text-primary-foreground fill-current" />
                </div>
              </motion.div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Blessing Confirmed! 🙏
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                You just made someone's day.
              </p>

              {/* Updated counter */}
              <div className="bg-secondary/50 rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-2">
                  You're part of something beautiful
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-6 h-6 text-primary" />
                  <span className="text-2xl font-bold text-foreground">
                    {(blessingCount + 1).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">blessings confirmed</span>
                </div>
              </div>

              {/* CTA to join */}
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-muted-foreground mb-3">
                  Want to spread your own blessings?
                </p>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => window.location.href = "/challenge"}
                >
                  Join the 3-Day Challenge
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Confirm;
