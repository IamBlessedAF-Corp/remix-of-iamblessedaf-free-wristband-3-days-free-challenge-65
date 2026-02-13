import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

const useCountdown = (minutes: number, storageKey: string) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      const remaining = Math.max(0, Math.floor((parseInt(saved) - Date.now()) / 1000));
      return remaining > 0 ? remaining : minutes * 60;
    }
    const end = Date.now() + minutes * 60 * 1000;
    sessionStorage.setItem(storageKey, end.toString());
    return minutes * 60;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  return { mins, secs, expired: timeLeft <= 0 };
};

const WristbandDiscountBanner = () => {
  const { mins, secs, expired } = useCountdown(15, "offer22-timer-end");

  return (
    <div className="space-y-3">
      {/* Heading */}
      <p className="text-3xl md:text-4xl font-black text-primary">
        TRIGGER REMINDERS
      </p>

      {/* Timer */}
      <div className="bg-card border border-border/50 rounded-xl p-3 shadow-soft">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Timer className="w-4 h-4 text-primary animate-pulse" />
          <p className="text-sm font-bold text-primary">
            {expired
              ? "Offer expired!"
              : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} left at this price`}
          </p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          3 Neuro-Hacker Wristbands worth <span className="font-bold text-foreground">$33</span> — get them today for just{" "}
          <span className="font-bold text-foreground">$22</span>
        </p>
      </div>

      {/* Discount badge */}
      <p className="text-2xl md:text-3xl font-black text-primary">
        33% OFF TODAY
      </p>

      {/* Price block */}
      <div className="flex items-center justify-center gap-4">
        <p className="text-lg md:text-xl font-bold text-foreground leading-tight text-left">
          3 Neuro-Hacker Wristbands
          <br />
          <span className="text-sm text-muted-foreground font-normal">Tap · Share · Remind</span>
        </p>

        <div className="bg-card border border-border/50 rounded-xl px-4 py-3 text-center shadow-soft">
          <p className="text-xs text-muted-foreground mb-0.5">Intl Delivery</p>
          <p className="text-base text-muted-foreground line-through leading-tight">$33</p>
          <p className="text-2xl font-bold text-primary leading-tight">$22</p>
        </div>
      </div>
    </div>
  );
};

export default WristbandDiscountBanner;
