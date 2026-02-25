import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";

interface NominationCountdownProps {
  expiresAt: string;
  recipientName?: string;
  variant?: "banner" | "inline";
}

/**
 * NominationCountdown — Shows the 11h 11m countdown for nominees.
 */
export default function NominationCountdown({
  expiresAt,
  recipientName,
  variant = "banner",
}: NominationCountdownProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const end = new Date(expiresAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft("Time's up!");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
      setIsUrgent(hours < 2);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (variant === "inline") {
    return (
      <span className={`text-xs font-mono font-bold ${isUrgent ? "text-destructive" : "text-primary"}`}>
        ⏱️ {timeLeft}
      </span>
    );
  }

  return (
    <motion.div
      className={`rounded-xl p-3 flex items-center justify-between ${
        isExpired
          ? "bg-destructive/10 border border-destructive/20"
          : isUrgent
          ? "bg-destructive/10 border border-destructive/20 animate-pulse"
          : "bg-primary/10 border border-primary/20"
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2">
        {isUrgent ? (
          <AlertTriangle className="w-4 h-4 text-destructive" />
        ) : (
          <Clock className="w-4 h-4 text-primary" />
        )}
        <div>
          <p className="text-xs font-bold text-foreground">
            {isExpired
              ? "Challenge expired"
              : recipientName
              ? `${recipientName} has`
              : "Time remaining"}
          </p>
          {!isExpired && (
            <p className="text-[10px] text-muted-foreground">
              to accept the challenge
            </p>
          )}
        </div>
      </div>
      <span
        className={`text-lg font-mono font-black ${
          isExpired ? "text-destructive" : isUrgent ? "text-destructive" : "text-primary"
        }`}
      >
        {timeLeft}
      </span>
    </motion.div>
  );
}
