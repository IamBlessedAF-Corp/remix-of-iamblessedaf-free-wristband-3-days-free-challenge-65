import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const LeadPageCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem("lead-offer-end");
    if (saved) {
      const remaining = Math.max(0, parseInt(saved) - Date.now());
      return remaining > 0 ? remaining : THIRTY_DAYS_MS;
    }
    const end = Date.now() + THIRTY_DAYS_MS;
    localStorage.setItem("lead-offer-end", end.toString());
    return THIRTY_DAYS_MS;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        const next = Math.max(0, t - 1000);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const totalSecs = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-primary uppercase tracking-wider">
          FREE $3,300 Credit + System Expires In
        </span>
      </div>
      <div className="flex items-center justify-center gap-3">
        {[
          { val: days, label: "Days" },
          { val: hours, label: "Hours" },
          { val: mins, label: "Mins" },
          { val: secs, label: "Secs" },
        ].map((t, i) => (
          <div key={i} className="text-center">
            <div className="bg-background border border-border/40 rounded-lg w-14 h-14 flex items-center justify-center">
              <span className="text-xl font-black text-foreground font-mono">
                {String(t.val).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[9px] text-muted-foreground font-medium uppercase mt-1 block">
              {t.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadPageCountdown;
