import { motion } from "framer-motion";
import { Crown, Medal, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/hooks/usePortalData";
import { getTier } from "@/hooks/usePortalData";

interface Props {
  leaderboard: LeaderboardEntry[];
  currentUserId: string | null;
}

const RANK_ICONS = [
  <Crown key="1st" className="w-5 h-5 text-primary" />,
  <Medal key="2nd" className="w-5 h-5 text-muted-foreground" />,
  <Medal key="3rd" className="w-5 h-5 text-accent-foreground" />,
];

export default function PortalLeaderboard({ leaderboard, currentUserId }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Global Leaderboard
        </h2>
        <span className="text-xs text-muted-foreground">{leaderboard.length} Ambassadors</span>
      </div>

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 0, 2].map((rank) => {
            const entry = leaderboard[rank];
            if (!entry) return null;
            const tier = getTier((entry.blessings_confirmed ?? 0) * 20);
            const isMe = entry.user_id === currentUserId;
            return (
              <motion.div
                key={entry.id}
                className={`flex flex-col items-center p-4 rounded-xl border ${
                  rank === 0
                    ? "bg-primary/5 border-primary/30 order-2 -mt-2"
                    : rank === 1
                    ? "bg-card border-border/60 order-1"
                    : "bg-card border-border/60 order-3"
                } ${isMe ? "ring-2 ring-primary/40" : ""}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: rank * 0.1 }}
              >
                <div className="text-2xl mb-1">{RANK_ICONS[rank]}</div>
                <span className="text-lg">{tier.current.emoji}</span>
                <p className="text-sm font-bold text-foreground text-center truncate w-full mt-1">
                  {entry.display_name || "Ambassador"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {entry.blessings_confirmed ?? 0} blessings
                </p>
                {isMe && (
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full mt-1">
                    YOU
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full ranking */}
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_6rem_5rem] px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/30">
          <span>#</span>
          <span>Ambassador</span>
          <span className="text-center">Blessings</span>
          <span className="text-center">Tier</span>
        </div>
        <div className="divide-y divide-border/20 max-h-[28rem] overflow-y-auto">
          {leaderboard.map((entry, i) => {
            const tier = getTier((entry.blessings_confirmed ?? 0) * 20);
            const isMe = entry.user_id === currentUserId;
            return (
              <motion.div
                key={entry.id ?? i}
                className={`grid grid-cols-[3rem_1fr_6rem_5rem] items-center px-4 py-3 text-sm ${
                  isMe ? "bg-primary/5" : ""
                }`}
                initial={{ x: -8, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
              >
                <span className="font-bold text-muted-foreground">{i + 1}</span>
                <div className="flex items-center gap-2 truncate">
                  <span className="text-foreground font-medium truncate">
                    {entry.display_name || "Ambassador"}
                  </span>
                  {isMe && (
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full shrink-0">
                      YOU
                    </span>
                  )}
                </div>
                <span className="text-center font-semibold text-foreground">
                  {entry.blessings_confirmed ?? 0}
                </span>
                <span className="text-center">{tier.current.emoji}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
