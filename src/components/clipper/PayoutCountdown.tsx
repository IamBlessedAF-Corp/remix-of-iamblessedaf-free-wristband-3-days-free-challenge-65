import { useState, useEffect } from "react";
import { Clock, Calendar, Shield, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const getNextMonday = () => {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntil = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + daysUntil);
  next.setUTCHours(0, 0, 0, 0);
  return next;
};

const getNextFriday = () => {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntil = day <= 5 ? 5 - day : 12 - day;
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + (daysUntil === 0 ? 7 : daysUntil));
  next.setUTCHours(0, 0, 0, 0);
  return next;
};

const PayoutCountdown = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nextMonday = getNextMonday();
  const nextFriday = getNextFriday();

  const day = now.getUTCDay();
  // Mon-Thu = review period, Fri = payout day, Sat-Sun + rest = earning period
  const isReviewPeriod = day >= 1 && day <= 4;
  const isPayoutDay = day === 5;

  const targetDate = isReviewPeriod ? nextFriday : nextMonday;
  const diffMs = Math.max(0, targetDate.getTime() - now.getTime());
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Payout Cycle</h3>
        </div>
        <Badge className={`text-[10px] ${
          isPayoutDay
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            : isReviewPeriod
            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
            : "bg-primary/15 text-primary border-primary/30"
        }`}>
          {isPayoutDay ? "💰 Payout Day" : isReviewPeriod ? "🔍 Review Period" : "📈 Earning Window"}
        </Badge>
      </div>

      <div className="bg-secondary/50 rounded-xl p-4">
        <p className="text-[11px] text-muted-foreground text-center mb-2">
          {isReviewPeriod ? "Payout in" : isPayoutDay ? "Next cut-off in" : "Cut-off in"}
        </p>
        <div className="flex items-center justify-center gap-2">
          {[
            { val: days, label: "D" },
            { val: hours, label: "H" },
            { val: minutes, label: "M" },
            { val: seconds, label: "S" },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="bg-card border border-border/30 rounded-lg w-12 h-12 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground font-mono">
                  {String(val).padStart(2, "0")}
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground mt-0.5 block">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-[11px]">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Cut-off: Monday 00:00 UTC</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Review: Mon–Thu (views, CTR, fraud)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <AlertTriangle className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Payout: Friday</span>
        </div>
      </div>
    </div>
  );
};

export default PayoutCountdown;
