import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle2, Clock, Coins, Flame, Share2, Users, Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: any;
  target: number;
  type: "daily" | "weekly";
}

const MISSIONS: Mission[] = [
  { id: "daily-visit", title: "Visit the Portal", description: "Check in daily to earn BC", reward: 10, icon: Eye, target: 1, type: "daily" },
  { id: "daily-share", title: "Share Your Link", description: "Share your blessing link once", reward: 30, icon: Share2, target: 1, type: "daily" },
  { id: "daily-bless", title: "Bless a Friend", description: "Send a blessing to someone special", reward: 50, icon: Users, target: 1, type: "daily" },
  { id: "weekly-bless5", title: "Bless 5 Friends", description: "Send blessings to 5 different people", reward: 200, icon: Users, target: 5, type: "weekly" },
  { id: "weekly-streak3", title: "3-Day Login Streak", description: "Visit the portal 3 days in a row", reward: 100, icon: Flame, target: 3, type: "weekly" },
];

function getMissionKey(missionId: string, type: "daily" | "weekly"): string {
  const now = new Date();
  if (type === "daily") {
    return `mission_${missionId}_${now.toISOString().split("T")[0]}`;
  }
  // Weekly: use ISO week
  const dayOfWeek = now.getDay() || 7;
  const thursdayDate = new Date(now);
  thursdayDate.setDate(now.getDate() + 4 - dayOfWeek);
  const yearStart = new Date(thursdayDate.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((thursdayDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `mission_${missionId}_${thursdayDate.getFullYear()}-W${weekNo}`;
}

function getProgress(missionId: string, type: "daily" | "weekly"): number {
  const key = getMissionKey(missionId, type);
  return parseInt(localStorage.getItem(key) ?? "0", 10);
}

function completeStep(missionId: string, type: "daily" | "weekly") {
  const key = getMissionKey(missionId, type);
  const current = parseInt(localStorage.getItem(key) ?? "0", 10);
  localStorage.setItem(key, String(current + 1));
}

export default function PortalMissions() {
  const [progresses, setProgresses] = useState<Record<string, number>>({});

  useEffect(() => {
    // Auto-complete "daily-visit" mission
    const visitKey = getMissionKey("daily-visit", "daily");
    if (!localStorage.getItem(visitKey)) {
      completeStep("daily-visit", "daily");
    }

    // Load all progresses
    const p: Record<string, number> = {};
    MISSIONS.forEach((m) => {
      p[m.id] = getProgress(m.id, m.type);
    });
    setProgresses(p);
  }, []);

  const dailyMissions = MISSIONS.filter((m) => m.type === "daily");
  const weeklyMissions = MISSIONS.filter((m) => m.type === "weekly");

  const renderMission = (m: Mission, i: number) => {
    const progress = progresses[m.id] ?? 0;
    const completed = progress >= m.target;
    const pct = Math.min((progress / m.target) * 100, 100);

    return (
      <motion.div
        key={m.id}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
          completed
            ? "bg-primary/5 border-primary/20"
            : "bg-card border-border/40"
        }`}
        initial={{ x: -8, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: i * 0.05 }}
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          completed ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
        }`}>
          {completed ? <CheckCircle2 className="w-4.5 h-4.5" /> : <m.icon className="w-4 h-4" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-semibold ${completed ? "text-primary" : "text-foreground"}`}>
              {m.title}
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-primary shrink-0 ml-2">
              <Coins className="w-3 h-3" />
              +{m.reward}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{m.description}</p>
          {!completed && m.target > 1 && (
            <div className="mt-1.5 flex items-center gap-2">
              <Progress value={pct} className="h-1.5 flex-1" />
              <span className="text-[10px] text-muted-foreground">{progress}/{m.target}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Challenge Missions
      </h2>

      {/* Daily */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Daily Missions</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">Resets at midnight</span>
        </div>
        <div className="space-y-2">
          {dailyMissions.map((m, i) => renderMission(m, i))}
        </div>
      </div>

      {/* Weekly */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Weekly Missions</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">Resets Monday</span>
        </div>
        <div className="space-y-2">
          {weeklyMissions.map((m, i) => renderMission(m, i + dailyMissions.length))}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-accent/40 border border-primary/15 rounded-xl p-4">
        <p className="text-xs text-muted-foreground">
          💡 <strong className="text-foreground">Missions</strong> reward you with BC coins for daily activity.
          Complete all daily missions to earn <strong className="text-primary">90 BC/day</strong> — that's{" "}
          <strong className="text-primary">2,700 BC/month</strong> just from missions!
        </p>
      </div>
    </div>
  );
}
