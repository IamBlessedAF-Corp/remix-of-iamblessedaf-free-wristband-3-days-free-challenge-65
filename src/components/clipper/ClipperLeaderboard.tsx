import { motion } from "framer-motion";
import { Crown, Medal, Flame, Eye, Film, Loader2 } from "lucide-react";
import type { LeaderboardClipper } from "@/hooks/useClipperLeaderboard";

interface Props {
  leaderboard: LeaderboardClipper[];
  isLive: boolean;
  loading: boolean;
}

const RANK_STYLE: Record<number, { icon: React.ReactNode; accent: string }> = {
  1: { icon: <Crown className="w-4 h-4 text-primary" />, accent: "bg-primary/10 border-primary/30" },
  2: { icon: <Medal className="w-4 h-4 text-muted-foreground" />, accent: "bg-secondary border-border/60" },
  3: { icon: <Medal className="w-4 h-4 text-accent-foreground" />, accent: "bg-secondary border-border/60" },
};

export default function ClipperLeaderboard({ leaderboard, isLive, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-5 flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (leaderboard.length === 0) return null;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Weekly Leaderboard</h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isLive
            ? "bg-green-500/10 text-green-500"
            : "bg-primary/10 text-primary"
        }`}>
          {isLive ? "LIVE" : "CAMPAIGN"}
        </span>
      </div>

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 0, 2].map((idx) => {
            const entry = leaderboard[idx];
            if (!entry) return null;
            const style = RANK_STYLE[entry.rank] ?? { icon: null, accent: "bg-secondary border-border/40" };
            return (
              <motion.div
                key={entry.rank}
                className={`flex flex-col items-center p-3 rounded-xl border ${style.accent} ${
                  idx === 0 ? "order-2 -mt-1" : idx === 1 ? "order-1" : "order-3"
                } ${entry.isCurrentUser ? "ring-2 ring-primary/40" : ""}`}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.08 }}
              >
                <div className="text-lg mb-0.5">{style.icon}</div>
                <p className="text-[11px] font-bold text-foreground text-center truncate w-full">
                  {entry.displayName}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  {entry.viewsThisWeek >= 1000
                    ? `${(entry.viewsThisWeek / 1000).toFixed(1)}k`
                    : entry.viewsThisWeek}
                </p>
                {entry.isCurrentUser && (
                  <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full mt-1">
                    YOU
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full ranking list */}
      <div className="border border-border/30 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2rem_1fr_4.5rem_3.5rem] px-3 py-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
          <span>#</span>
          <span>Clipper</span>
          <span className="text-right">Views</span>
          <span className="text-right">Clips</span>
        </div>
        <div className="divide-y divide-border/15 max-h-[18rem] overflow-y-auto">
          {leaderboard.map((entry, i) => (
            <motion.div
              key={`${entry.rank}-${entry.displayName}`}
              className={`grid grid-cols-[2rem_1fr_4.5rem_3.5rem] items-center px-3 py-2.5 text-sm ${
                entry.isCurrentUser ? "bg-primary/5" : ""
              }`}
              initial={{ x: -6, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.02, duration: 0.15 }}
            >
              <span className="text-xs font-bold text-muted-foreground">{entry.rank}</span>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-foreground font-medium text-xs truncate">
                  {entry.displayName}
                </span>
                {entry.isCurrentUser && (
                  <span className="text-[9px] bg-primary/10 text-primary font-bold px-1 py-0.5 rounded-full shrink-0">
                    YOU
                  </span>
                )}
              </div>
              <span className="text-right text-xs font-semibold text-foreground flex items-center justify-end gap-0.5">
                <Eye className="w-3 h-3 text-muted-foreground" />
                {entry.viewsThisWeek >= 1000
                  ? `${(entry.viewsThisWeek / 1000).toFixed(1)}k`
                  : entry.viewsThisWeek}
              </span>
              <span className="text-right text-xs text-muted-foreground flex items-center justify-end gap-0.5">
                <Film className="w-3 h-3" />
                {entry.clipsThisWeek}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {!isLive && (
        <p className="text-[10px] text-muted-foreground text-center mt-3 opacity-70">
          Early campaign data — updates to live rankings as clippers join
        </p>
      )}
    </div>
  );
}
