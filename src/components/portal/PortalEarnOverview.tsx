import { motion } from "framer-motion";
import { Coins, TrendingUp, Gift, Star, Zap } from "lucide-react";

interface EarnMethod {
  action: string;
  reward: string;
  isFree: boolean;
  frequency: string;
}

const EARN_METHODS: EarnMethod[] = [
  { action: "Daily login bonus", reward: "10–50 BC", isFree: true, frequency: "Daily" },
  { action: "Copy & share your link", reward: "+5 BC", isFree: true, frequency: "Anytime" },
  { action: "Send gift via WhatsApp", reward: "+15 BC", isFree: true, frequency: "Per send" },
  { action: "Send gift via SMS", reward: "+15 BC", isFree: true, frequency: "Per send" },
  { action: "Post on social media", reward: "+30 BC", isFree: true, frequency: "Per platform" },
  { action: "Post video/story with wristband", reward: "+60 BC", isFree: true, frequency: "Per post" },
  { action: "Friend confirms blessing", reward: "+50 BC", isFree: true, frequency: "Per confirm" },
  { action: "Bless 3 friends in one day", reward: "+50 BC", isFree: true, frequency: "Daily" },
  { action: "Complete daily missions", reward: "+90 BC", isFree: true, frequency: "Daily" },
  { action: "7-day login streak", reward: "+100 BC", isFree: true, frequency: "Weekly" },
  { action: "Refer 10 friends", reward: "+500 BC", isFree: true, frequency: "Milestone" },
  { action: "Purchase any pack", reward: "111–4,444 BC", isFree: false, frequency: "Per purchase" },
];

export default function PortalEarnOverview() {
  const freeTotal = "2,700+";
  const monthlyEstimate = "5,000+";

  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 border-b border-primary/10 p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            All Ways to Earn BC
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Earn up to <span className="font-bold text-primary">{monthlyEstimate} BC/month</span> — 
          most are completely <span className="font-bold text-primary">FREE</span>
        </p>
      </div>

      {/* Method list */}
      <div className="divide-y divide-border/20">
        {EARN_METHODS.map((method, i) => (
          <motion.div
            key={method.action}
            className="flex items-center gap-3 px-4 py-3 hover:bg-primary/[0.02] transition-colors"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
              method.isFree 
                ? "bg-primary/10 text-primary" 
                : "bg-secondary text-muted-foreground"
            }`}>
              {method.isFree ? <Gift className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm text-foreground font-medium truncate">{method.action}</p>
                {method.isFree && (
                  <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0">
                    Free
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">{method.frequency}</p>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-primary shrink-0">
              <Coins className="w-3 h-3" />
              {method.reward}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="p-4 bg-primary/5 border-t border-primary/10">
        <div className="flex items-center gap-2 text-center justify-center">
          <Zap className="w-4 h-4 text-primary" />
          <p className="text-xs font-bold text-foreground">
            Just from FREE actions: <span className="text-primary">{freeTotal} BC/month</span>
          </p>
        </div>
      </div>
    </div>
  );
}
