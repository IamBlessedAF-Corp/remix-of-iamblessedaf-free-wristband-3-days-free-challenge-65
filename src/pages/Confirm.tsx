import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CheckCircle, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const Confirm = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "ready" | "confirming" | "confirmed" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [globalCount, setGlobalCount] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      // Fetch global blessing count
      const { data: countData } = await supabase.rpc("get_global_blessing_count");
      if (countData !== null) {
        setGlobalCount(countData);
      }

      // Check if we have a valid token
      if (!token) {
        setStatus("error");
        setErrorMessage("Invalid confirmation link");
        return;
      }

      setStatus("ready");
    };

    init();
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;

    setStatus("confirming");

    try {
      // Call the rate-limited edge function to confirm the blessing
      const response = await supabase.functions.invoke("confirm-blessing", {
        body: { token },
      });

      if (response.error) {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
        return;
      }

      const result = response.data as { success: boolean; error?: string; message?: string };

      if (!result.success) {
        setStatus("error");
        setErrorMessage(result.error || "Unable to confirm blessing");
        return;
      }

      setStatus("confirmed");
      setGlobalCount((prev) => prev + 1);
    } catch (err) {
      setStatus("error");
      setErrorMessage("Connection error. Please try again.");
    }
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
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="bg-destructive/10 rounded-full p-6 inline-block mb-6">
                <AlertCircle className="w-12 h-12 text-destructive" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Oops! 😅
              </h1>
              <p className="text-muted-foreground mb-8">{errorMessage}</p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/challenge")}
              >
                Join the Challenge
              </Button>
            </motion.div>
          )}

          {status === "ready" && (
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
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleConfirm}
                  className="w-full h-20 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl btn-glow transition-all duration-300"
                >
                  <span className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6" />
                    Confirm Blessing ✅
                  </span>
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
                  <strong className="text-foreground">
                    {globalCount.toLocaleString()}
                  </strong>{" "}
                  blessings confirmed worldwide
                </span>
              </motion.div>
            </motion.div>
          )}

          {status === "confirming" && (
            <motion.div
              key="confirming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Someone blessed you! 💫
              </h1>
              <p className="text-muted-foreground mb-8">
                Tap below to confirm you received their gratitude message.
              </p>
              <Button
                disabled
                className="w-full h-20 text-xl font-bold bg-primary text-primary-foreground rounded-2xl"
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                  Confirming...
                </span>
              </Button>
            </motion.div>
          )}

          {status === "confirmed" && (
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
                    backgroundColor:
                      i % 2 === 0
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted-foreground))",
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
                    {globalCount.toLocaleString()}
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
                  onClick={() => (window.location.href = "/challenge")}
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
