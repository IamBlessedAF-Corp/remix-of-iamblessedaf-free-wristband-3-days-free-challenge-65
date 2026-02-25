import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Target, CheckCircle2, Clock, Coins, Flame, Share2, Users, Eye,
  MessageCircle, Video, Heart, Trophy, Star, Zap, ExternalLink, Copy, ChevronRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: any;
  target: number;
  type: "daily" | "weekly" | "milestone";
  isFree: boolean;
}

const MISSIONS: Mission[] = [
  // Daily — FREE
  { id: "daily-visit", title: "Visit the Portal", description: "Check in daily", reward: 10, icon: Eye, target: 1, type: "daily", isFree: true },
  { id: "daily-share", title: "Share Your Link", description: "Copy or share your blessing link", reward: 15, icon: Share2, target: 1, type: "daily", isFree: true },
  { id: "daily-bless", title: "Gift a FREE Wristband", description: "Send via SMS or WhatsApp", reward: 30, icon: MessageCircle, target: 1, type: "daily", isFree: true },
  { id: "daily-social", title: "Post on Social Media", description: "Post on TikTok, IG, X, or FB", reward: 30, icon: Video, target: 1, type: "daily", isFree: true },
  { id: "daily-bless3", title: "Bless 3 Friends", description: "Send gifts to 3 different people", reward: 50, icon: Users, target: 3, type: "daily", isFree: true },

  // Weekly — FREE
  { id: "weekly-streak3", title: "3-Day Login Streak", description: "Visit 3 days in a row", reward: 100, icon: Flame, target: 3, type: "weekly", isFree: true },
  { id: "weekly-bless5", title: "Bless 5 Friends", description: "Gift 5 wristbands this week", reward: 200, icon: Heart, target: 5, type: "weekly", isFree: true },
  { id: "weekly-social3", title: "Post on 3 Platforms", description: "Share on 3 different social platforms", reward: 150, icon: Share2, target: 3, type: "weekly", isFree: true },
  { id: "weekly-story", title: "Post a Video/Story", description: "Show your wristband on video & tag us", reward: 100, icon: Video, target: 1, type: "weekly", isFree: true },

  // Milestones — FREE
  { id: "mile-10bless", title: "Bless 10 Friends", description: "Lifetime milestone", reward: 500, icon: Trophy, target: 10, type: "milestone", isFree: true },
  { id: "mile-50bless", title: "Bless 50 Friends", description: "Legendary status", reward: 2000, icon: Star, target: 50, type: "milestone", isFree: true },
  { id: "mile-100clicks", title: "100 Link Clicks", description: "Your link reached 100 clicks", reward: 300, icon: Zap, target: 100, type: "milestone", isFree: true },
];

function getMissionKey(missionId: string, type: string): string {
  const now = new Date();
  if (type === "daily") {
    return `mission_${missionId}_${now.toISOString().split("T")[0]}`;
  }
  if (type === "weekly") {
    const dayOfWeek = now.getDay() || 7;
    const thursdayDate = new Date(now);
    thursdayDate.setDate(now.getDate() + 4 - dayOfWeek);
    const yearStart = new Date(thursdayDate.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((thursdayDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `mission_${missionId}_${thursdayDate.getFullYear()}-W${weekNo}`;
  }
  return `mission_${missionId}_lifetime`;
}

function getProgress(missionId: string, type: string): number {
  const key = getMissionKey(missionId, type);
  return parseInt(localStorage.getItem(key) ?? "0", 10);
}

function completeStep(missionId: string, type: string) {
  const key = getMissionKey(missionId, type);
  const current = parseInt(localStorage.getItem(key) ?? "0", 10);
  localStorage.setItem(key, String(current + 1));
}

interface PortalMissionsProps {
  referralCode?: string;
  displayName?: string | null;
  onNavigateTab?: (tab: string) => void;
}

export default function PortalMissions({ referralCode, displayName, onNavigateTab }: PortalMissionsProps) {
  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    const visitKey = getMissionKey("daily-visit", "daily");
    if (!localStorage.getItem(visitKey)) {
      completeStep("daily-visit", "daily");
    }
    const p: Record<string, number> = {};
    MISSIONS.forEach((m) => {
      p[m.id] = getProgress(m.id, m.type);
    });
    setProgresses(p);
  }, []);

  const shareUrl = referralCode
    ? `https://iamblessedaf.com/r/${referralCode}`
    : "https://iamblessedaf.com";
  
  const shareText = `${displayName || "Someone"} just blessed you with a FREE Neuro-Hacker Wristband 🧠✨ Claim yours here:`;

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "✅ Link copied!", description: "Now paste it anywhere to share!" });
    completeStep("daily-share", "daily");
    setProgresses(p => ({ ...p, "daily-share": (p["daily-share"] ?? 0) + 1 }));
  }, [shareUrl, toast]);

  const handleWhatsApp = useCallback(() => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, "_blank");
    completeStep("daily-bless", "daily");
    setProgresses(p => ({ ...p, "daily-bless": (p["daily-bless"] ?? 0) + 1 }));
  }, [shareUrl, shareText]);

  const handleSMS = useCallback(() => {
    window.open(`sms:?&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, "_blank");
    completeStep("daily-bless", "daily");
    setProgresses(p => ({ ...p, "daily-bless": (p["daily-bless"] ?? 0) + 1 }));
  }, [shareUrl, shareText]);

  const handlePostSocial = useCallback((platform: string) => {
    const urls: Record<string, string> = {
      tiktok: `https://www.tiktok.com/upload`,
      instagram: `https://www.instagram.com/`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform] || urls.twitter, "_blank");
    completeStep("daily-social", "daily");
    setProgresses(p => ({ ...p, "daily-social": (p["daily-social"] ?? 0) + 1 }));
  }, [shareUrl, shareText]);

  const handleBlessFriends = useCallback(() => {
    if (onNavigateTab) {
      onNavigateTab("nominate");
    }
  }, [onNavigateTab]);

  const handleGoToClip = useCallback(() => {
    if (onNavigateTab) {
      onNavigateTab("clip");
    }
  }, [onNavigateTab]);

  const handleGoToRepost = useCallback(() => {
    if (onNavigateTab) {
      onNavigateTab("repost");
    }
  }, [onNavigateTab]);

  const handleGoToReferrals = useCallback(() => {
    if (onNavigateTab) {
      onNavigateTab("referrals");
    }
  }, [onNavigateTab]);

  // Map mission IDs to click actions
  const getMissionAction = (missionId: string): (() => void) | null => {
    switch (missionId) {
      case "daily-visit":
        return null; // Auto-completed
      case "daily-share":
        return handleCopyLink;
      case "daily-bless":
        return handleWhatsApp;
      case "daily-social":
        return () => handlePostSocial("twitter");
      case "daily-bless3":
        return handleBlessFriends;
      case "weekly-streak3":
        return null; // Auto-tracked
      case "weekly-bless5":
        return handleBlessFriends;
      case "weekly-social3":
        return () => handlePostSocial("twitter");
      case "weekly-story":
        return handleGoToClip;
      case "mile-10bless":
        return handleBlessFriends;
      case "mile-50bless":
        return handleBlessFriends;
      case "mile-100clicks":
        return handleGoToReferrals;
      default:
        return null;
    }
  };

  // Action labels for missions
  const getMissionActionLabel = (missionId: string): string | null => {
    switch (missionId) {
      case "daily-share": return "Copy Link";
      case "daily-bless": return "Send Now";
      case "daily-social": return "Post Now";
      case "daily-bless3": return "Nominate";
      case "weekly-bless5": return "Nominate";
      case "weekly-social3": return "Share Now";
      case "weekly-story": return "Create Clip";
      case "mile-10bless": return "Nominate";
      case "mile-50bless": return "Nominate";
      case "mile-100clicks": return "View Stats";
      default: return null;
    }
  };

  // Social platform quick-pick for social missions
  const isSocialMission = (id: string) =>
    id === "daily-social" || id === "weekly-social3";

  const dailyMissions = MISSIONS.filter((m) => m.type === "daily");
  const weeklyMissions = MISSIONS.filter((m) => m.type === "weekly");
  const milestoneMissions = MISSIONS.filter((m) => m.type === "milestone");

  const dailyTotal = dailyMissions.reduce((s, m) => s + m.reward, 0);
  const weeklyTotal = weeklyMissions.reduce((s, m) => s + m.reward, 0);

  const renderMission = (m: Mission, i: number) => {
    const progress = progresses[m.id] ?? 0;
    const completed = progress >= m.target;
    const pct = Math.min((progress / m.target) * 100, 100);
    const action = getMissionAction(m.id);
    const actionLabel = getMissionActionLabel(m.id);
    const isSocial = isSocialMission(m.id);

    return (
      <motion.div
        key={m.id}
        className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${
          completed
            ? "bg-primary/5 border-primary/20"
            : action
              ? "bg-card border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] cursor-pointer"
              : "bg-card border-border/40"
        }`}
        initial={{ x: -8, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: i * 0.04 }}
        onClick={!completed && action && !isSocial ? action : undefined}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            completed ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
          }`}>
            {completed ? <CheckCircle2 className="w-4.5 h-4.5" /> : <m.icon className="w-4 h-4" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold ${completed ? "text-primary" : "text-foreground"}`}>
                {m.title}
              </p>
              {m.isFree && !completed && (
                <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0">
                  Free
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{m.description}</p>
            {!completed && m.target > 1 && (
              <div className="mt-1.5 flex items-center gap-2">
                <Progress value={pct} className="h-1.5 flex-1" />
                <span className="text-[10px] text-muted-foreground">{progress}/{m.target}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <div className="flex items-center gap-1 text-xs font-bold text-primary">
              <Coins className="w-3 h-3" />
              +{m.reward}
            </div>
            {!completed && action && !isSocial && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Action buttons for social missions or specific quick-actions */}
        {!completed && isSocial && (
          <div className="flex gap-1.5 pl-12">
            {[
              { key: "twitter", label: "𝕏 / Twitter", emoji: "🐦" },
              { key: "facebook", label: "Facebook", emoji: "📘" },
              { key: "instagram", label: "Instagram", emoji: "📸" },
              { key: "tiktok", label: "TikTok", emoji: "🎵" },
            ].map(p => (
              <button
                key={p.key}
                onClick={(e) => { e.stopPropagation(); handlePostSocial(p.key); }}
                className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-secondary hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
              >
                <span>{p.emoji}</span>
                <span className="hidden sm:inline">{p.label}</span>
              </button>
            ))}
          </div>
        )}

        {!completed && m.id === "daily-bless" && (
          <div className="flex gap-1.5 pl-12">
            <button
              onClick={(e) => { e.stopPropagation(); handleWhatsApp(); }}
              className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-colors"
            >
              💬 WhatsApp
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSMS(); }}
              className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 transition-colors"
            >
              📱 SMS
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}
              className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-lg bg-secondary hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            >
              <Copy className="w-3 h-3" /> Copy Link
            </button>
          </div>
        )}

        {!completed && actionLabel && !isSocial && m.id !== "daily-bless" && m.id !== "daily-visit" && m.id !== "weekly-streak3" && (
          <div className="pl-12">
            <button
              onClick={(e) => { e.stopPropagation(); action?.(); }}
              className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              {actionLabel}
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  const renderSection = (
    title: string,
    subtitle: string,
    icon: any,
    missions: Mission[],
    startIndex: number
  ) => {
    const Icon = icon;
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">{subtitle}</span>
        </div>
        <div className="space-y-2">
          {missions.map((m, i) => renderMission(m, startIndex + i))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Challenge Missions
      </h2>

      {/* Potential earnings banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Coins className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">
            Earn up to <span className="text-primary">{dailyTotal} BC/day</span> + <span className="text-primary">{weeklyTotal} BC/week</span>
          </p>
          <p className="text-xs text-muted-foreground">All missions are FREE — just share, post, and bless!</p>
        </div>
      </div>

      {renderSection("Daily Missions", "Resets at midnight", Clock, dailyMissions, 0)}
      {renderSection("Weekly Missions", "Resets Monday", Flame, weeklyMissions, dailyMissions.length)}
      {renderSection("Milestones", "Lifetime achievements", Trophy, milestoneMissions, dailyMissions.length + weeklyMissions.length)}

      {/* Bottom tip */}
      <div className="bg-accent/40 border border-primary/15 rounded-xl p-4">
        <p className="text-xs text-muted-foreground">
          💡 <strong className="text-foreground">Stack your rewards:</strong> Complete all daily missions for{" "}
          <strong className="text-primary">{dailyTotal} BC/day</strong> = <strong className="text-primary">{(dailyTotal * 30).toLocaleString()} BC/month</strong> just from free missions!
        </p>
      </div>
    </div>
  );
}
