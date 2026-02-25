import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Medal, Crown, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SprintEntry {
  user_id: string;
  nominations_count: number;
  acceptances_count: number;
}

interface Sprint {
  id: string;
  name: string;
  ends_at: string;
  prize_description: string | null;
  status: string;
}

/**
 * WeeklyReferralSprint — Live leaderboard for weekly nomination competitions.
 */
export default function WeeklyReferralSprint() {
  const { user } = useAuth();
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [entries, setEntries] = useState<SprintEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const fetchSprint = async () => {
      const { data: sprints } = await supabase
        .from("referral_sprints")
        .select("*")
        .eq("status", "active" as any)
        .order("ends_at", { ascending: true })
        .limit(1);

      if (!sprints || sprints.length === 0) return;
      setSprint(sprints[0] as Sprint);

      const { data: leaderboard } = await supabase
        .from("sprint_entries")
        .select("user_id, nominations_count, acceptances_count")
        .eq("sprint_id", sprints[0].id)
        .order("nominations_count", { ascending: false })
        .limit(10);

      setEntries((leaderboard as SprintEntry[]) || []);
    };

    fetchSprint();
  }, []);

  // Countdown
  useEffect(() => {
    if (!sprint) return;

    const update = () => {
      const diff = new Date(sprint.ends_at).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Finished!");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft(`${days}d ${hours}h`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [sprint]);

  if (!sprint) return null;

  const rankIcons = [
    <Crown key="1" className="w-4 h-4 text-yellow-500" />,
    <Medal key="2" className="w-4 h-4 text-gray-400" />,
    <Medal key="3" className="w-4 h-4 text-amber-700" />,
  ];

  const myRank = entries.findIndex((e) => e.user_id === user?.id);
  const myEntry = myRank >= 0 ? entries[myRank] : null;

  return (
    <motion.div
      className="bg-card border border-border/50 rounded-xl p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">{sprint.name}</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {timeLeft}
        </div>
      </div>

      {sprint.prize_description && (
        <div className="bg-primary/10 rounded-lg p-2 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-foreground font-medium">{sprint.prize_description}</p>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-1.5">
        {entries.slice(0, 5).map((entry, idx) => (
          <div
            key={entry.user_id}
            className={`flex items-center justify-between p-2 rounded-lg ${
              entry.user_id === user?.id
                ? "bg-primary/10 border border-primary/20"
                : "bg-muted/20"
            }`}
          >
            <div className="flex items-center gap-2">
              {idx < 3 ? rankIcons[idx] : (
                <span className="text-xs font-bold text-muted-foreground w-4 text-center">
                  {idx + 1}
                </span>
              )}
              <span className="text-sm font-medium text-foreground">
                {entry.user_id === user?.id ? "You" : `Nominator #${idx + 1}`}
              </span>
            </div>
            <span className="text-sm font-bold text-primary">
              {entry.nominations_count}
            </span>
          </div>
        ))}
      </div>

      {myEntry && myRank >= 5 && (
        <div className="mt-2 p-2 bg-primary/5 rounded-lg flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Your rank: #{myRank + 1}</span>
          <span className="text-sm font-bold text-primary">{myEntry.nominations_count} nominations</span>
        </div>
      )}
    </motion.div>
  );
}
