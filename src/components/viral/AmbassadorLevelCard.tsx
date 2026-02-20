import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, ArrowUp, Star, Crown, Diamond } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const LEVELS = [
  { name: "Starter", min: 0, icon: Star, commission: 0, color: "text-muted-foreground", perks: "Free shipping" },
  { name: "Bronze", min: 10, icon: Award, commission: 0, color: "text-amber-700", perks: "Free shipping on all orders" },
  { name: "Silver", min: 25, icon: Award, commission: 10, color: "text-gray-400", perks: "10% commission + free shipping" },
  { name: "Gold", min: 50, icon: Crown, commission: 15, color: "text-yellow-500", perks: "15% commission + exclusive gold wristband" },
  { name: "Diamond", min: 100, icon: Diamond, commission: 20, color: "text-blue-400", perks: "20% commission + monthly bonus + featured" },
];

/**
 * AmbassadorLevelCard — Shows ambassador tier progress with real incentives.
 * Phase 3: Not just BC coins — real money commissions.
 */
export default function AmbassadorLevelCard() {
  const { user } = useAuth();
  const [totalReferrals, setTotalReferrals] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("ambassador_levels")
        .select("total_referrals")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setTotalReferrals((data as any).total_referrals || 0);
      } else {
        // Count from nominations
        const { count } = await supabase
          .from("nominations")
          .select("*", { count: "exact", head: true })
          .eq("sender_id", user.id)
          .eq("status", "accepted");
        setTotalReferrals(count || 0);
      }
    };

    fetch();
  }, [user]);

  const currentLevel = [...LEVELS].reverse().find((l) => totalReferrals >= l.min) || LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.min > totalReferrals);
  const progressToNext = nextLevel
    ? ((totalReferrals - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  const CurrentIcon = currentLevel.icon;

  return (
    <motion.div
      className="bg-card border border-border/50 rounded-xl p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CurrentIcon className={`w-5 h-5 ${currentLevel.color}`} />
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Nivel {currentLevel.name}
            </h3>
            <p className="text-[10px] text-muted-foreground">{currentLevel.perks}</p>
          </div>
        </div>
        <span className="text-lg font-black text-primary">{totalReferrals}</span>
      </div>

      {nextLevel && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              Siguiente: {nextLevel.name}
            </span>
            <span className="text-primary font-bold">
              {nextLevel.min - totalReferrals} referidos más
            </span>
          </div>
          <Progress value={progressToNext} className="h-2" />
          {nextLevel.commission > 0 && (
            <p className="text-[10px] text-muted-foreground">
              🎯 Desbloquea: {nextLevel.commission}% comisión en compras referidas
            </p>
          )}
        </div>
      )}

      {/* Level ladder */}
      <div className="flex items-center gap-1 mt-3">
        {LEVELS.map((level) => {
          const reached = totalReferrals >= level.min;
          const LevelIcon = level.icon;
          return (
            <div
              key={level.name}
              className={`flex-1 flex flex-col items-center gap-0.5 ${
                reached ? "opacity-100" : "opacity-30"
              }`}
              title={`${level.name}: ${level.min}+ referidos`}
            >
              <LevelIcon className={`w-3 h-3 ${level.color}`} />
              <div className={`w-full h-1 rounded-full ${reached ? "bg-primary" : "bg-secondary"}`} />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
