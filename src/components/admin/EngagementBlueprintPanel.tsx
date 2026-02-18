import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  MessageSquare, Mail, Clock, Users, Zap, Calendar,
  ArrowRight, AlertTriangle, CheckCircle2, Repeat, Timer,
  Send, Bell, Gift, Heart, Trophy, Shield, Smartphone,
  Power, Loader2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCampaignConfig } from "@/hooks/useCampaignConfig";
import { toast } from "sonner";

/* ─────────────────────── Types ─────────────────────── */

interface MessageSpec {
  id: string;
  name: string;
  channel: "sms" | "email" | "mms" | "whatsapp";
  content_preview: string;
  timing: string;
  per_user: string;
  /** day offset from signup for Gantt. -1 = on-demand */
  day_offset: number;
  /** duration in days for Gantt bar width */
  day_span: number;
}

interface TriggerGroup {
  id: string;
  config_key: string; // maps to campaign_config.key
  campaign: string;
  icon: React.ReactNode;
  description: string;
  trigger_type: "cron" | "event" | "user_action" | "webhook";
  frequency: string;
  edge_function: string;
  total_per_user: string;
  timeline: string;
  messages: MessageSpec[];
}

/* ─────────────────────── Data ─────────────────────── */

const TRIGGER_GROUPS: TriggerGroup[] = [
  {
    id: "challenge-onboard",
    config_key: "engagement_challenge_onboard",
    campaign: "Gratitude Challenge — Onboarding",
    icon: <Heart className="w-4 h-4 text-rose-400" />,
    description: "Triggered when a user signs up for the 3-day Gratitude Challenge via the setup flow.",
    trigger_type: "user_action",
    frequency: "1× per user (on signup)",
    edge_function: "schedule-challenge-messages",
    total_per_user: "1 SMS + 1 Email + up to 3 scheduled messages",
    timeline: "Immediately on signup → Day 1–3 automation",
    messages: [
      { id: "ch-welcome-sms", name: "Welcome SMS", channel: "sms", content_preview: "Hey {name}! 🙏 Your 3-Day Gratitude Challenge starts tomorrow at 11:11 AM...", timing: "Immediately on signup", per_user: "1× total", day_offset: 0, day_span: 1 },
      { id: "ch-welcome-email", name: "Welcome Email — \"You're early\"", channel: "email", content_preview: "You didn't scroll past. You didn't bookmark it for later. You decided.", timing: "Immediately on signup", per_user: "1× total", day_offset: 0, day_span: 1 },
      { id: "ch-day1-msg", name: "Day 1 — 11:11 Gratitude Text", channel: "sms", content_preview: "Your personalized message to {friend_1_name}", timing: "Next day at 11:11 AM", per_user: "1× total", day_offset: 1, day_span: 1 },
      { id: "ch-day2-msg", name: "Day 2 — 11:11 Gratitude Text", channel: "sms", content_preview: "Gratitude message to {friend_2_name}", timing: "+2 days at 11:11 AM", per_user: "1× (if friend_2)", day_offset: 2, day_span: 1 },
      { id: "ch-day3-msg", name: "Day 3 — 11:11 Gratitude Text", channel: "sms", content_preview: "Gratitude message to {friend_3_name}", timing: "+3 days at 11:11 AM", per_user: "1× (if friend_3)", day_offset: 3, day_span: 1 },
    ],
  },
  {
    id: "daily-reminders",
    config_key: "engagement_daily_reminders",
    campaign: "Gratitude Challenge — Daily Reminders",
    icon: <Bell className="w-4 h-4 text-amber-400" />,
    description: "Sends a 3 PM reminder the day before each scheduled 11:11 message.",
    trigger_type: "cron",
    frequency: "Every minute (pg_cron → send-scheduled-messages)",
    edge_function: "send-scheduled-messages",
    total_per_user: "Up to 3 reminders (1 per friend)",
    timeline: "Day 0 at 3 PM, Day 1 at 3 PM, Day 2 at 3 PM",
    messages: [
      { id: "rem-3pm", name: "3 PM Reminder", channel: "sms", content_preview: "Hey! Tomorrow at 11:11 AM your gratitude text to {friend_name} will be sent...", timing: "3 PM day before each message", per_user: "Up to 3", day_offset: 0, day_span: 3 },
    ],
  },
  {
    id: "followup-friends",
    config_key: "engagement_followup_friends",
    campaign: "Friend Collection Sequences",
    icon: <Users className="w-4 h-4 text-blue-400" />,
    description: "Automated follow-ups ask for additional friend names to extend the challenge.",
    trigger_type: "cron",
    frequency: "Every 30 min (pg_cron → send-followup-sequences)",
    edge_function: "send-followup-sequences",
    total_per_user: "Up to 2 SMS",
    timeline: "+2 days (Friend 2) → +3 days (Friend 3) at 10 AM",
    messages: [
      { id: "fu-step1", name: "Ask for Friend 2", channel: "sms", content_preview: "Who helped you when they didn't have to? Reply with their name!", timing: "+2 days at 10 AM", per_user: "1× (if no friend_2)", day_offset: 2, day_span: 1 },
      { id: "fu-step2", name: "Ask for Friend 3", channel: "sms", content_preview: "Who's someone unexpected you're grateful for? Reply with their name!", timing: "+3 days at 10 AM", per_user: "1× (if no friend_3)", day_offset: 3, day_span: 1 },
    ],
  },
  {
    id: "tgf-friday",
    config_key: "engagement_tgf_friday",
    campaign: "TGF Gratitude Fridays",
    icon: <Calendar className="w-4 h-4 text-green-400" />,
    description: "Weekly viral loop: every Friday sends a gratitude MMS with a referral wristband link.",
    trigger_type: "cron",
    frequency: "Every Friday at 7:00 AM UTC",
    edge_function: "tgf-friday",
    total_per_user: "1 MMS per week (indefinite)",
    timeline: "Every Friday, forever (while opted_in_sms = true)",
    messages: [
      { id: "tgf-weekly", name: "TGF Friday MMS", channel: "mms", content_preview: "Hey {sender}! Send this gratitude message to {friend_name}... 🙏", timing: "Every Friday 7 AM UTC", per_user: "1×/week, rotating", day_offset: 7, day_span: 1 },
    ],
  },
  {
    id: "otp-verification",
    config_key: "engagement_otp",
    campaign: "Authentication — OTP",
    icon: <Shield className="w-4 h-4 text-cyan-400" />,
    description: "6-digit code for phone or email verification. Rate limited to 10/hour/IP.",
    trigger_type: "user_action",
    frequency: "On demand (user requests login/verify)",
    edge_function: "send-otp / send-email-otp",
    total_per_user: "Unlimited (rate limited: 1/60s, 10/hr/IP)",
    timeline: "Expires in 10 min, max 5 attempts",
    messages: [
      { id: "otp-sms", name: "SMS OTP Code", channel: "sms", content_preview: "Your IamBlessedAF code is: {code}. Expires in 10 minutes.", timing: "Instant on request", per_user: "Max 10/hr/IP", day_offset: -1, day_span: 1 },
      { id: "otp-email", name: "Email OTP Code", channel: "email", content_preview: "Your verification code: {code}", timing: "Instant on request", per_user: "Max 10/hr/IP", day_offset: -1, day_span: 1 },
    ],
  },
  {
    id: "welcome-emails",
    config_key: "engagement_welcome_emails",
    campaign: "Lifecycle — Welcome Sequences",
    icon: <Mail className="w-4 h-4 text-purple-400" />,
    description: "Tailored welcome emails by segment. Triggered once per lead capture.",
    trigger_type: "event",
    frequency: "1× per user per segment (on form submit)",
    edge_function: "send-welcome-email / send-expert-welcome / send-network-marketer-welcome / send-wristband-welcome",
    total_per_user: "1 email per segment entry",
    timeline: "Immediately on form submission",
    messages: [
      { id: "wel-challenge", name: "Challenge Welcome", channel: "email", content_preview: "You just did something most people won't...", timing: "Instant on signup", per_user: "1× total", day_offset: 0, day_span: 1 },
      { id: "wel-expert", name: "Expert Welcome", channel: "email", content_preview: "The wristband funnel works incredibly well in your space...", timing: "Instant on expert form", per_user: "1× total", day_offset: 0, day_span: 1 },
      { id: "wel-nm", name: "NM Welcome — DM Scripts", channel: "email", content_preview: "5 platform-specific DM ice-breaker scripts...", timing: "Instant on NM form", per_user: "1× total", day_offset: 0, day_span: 1 },
      { id: "wel-wristband", name: "Wristband Waitlist Welcome", channel: "email", content_preview: "You're on the waitlist! 🧠🔥 FREE prototype...", timing: "Instant on waitlist signup", per_user: "1× total", day_offset: 0, day_span: 1 },
    ],
  },
  {
    id: "weekly-digest",
    config_key: "engagement_weekly_digest",
    campaign: "Lifecycle — Weekly Digest",
    icon: <Repeat className="w-4 h-4 text-orange-400" />,
    description: "Weekly performance summary for ambassadors with stats, tier progress, and BC balance.",
    trigger_type: "cron",
    frequency: "Every Monday at 9:00 AM UTC",
    edge_function: "send-weekly-digest",
    total_per_user: "1 email per week (opt-out available)",
    timeline: "Every Monday, indefinite (while digest_opted_out = false)",
    messages: [
      { id: "digest-weekly", name: "Weekly Digest Email", channel: "email", content_preview: "📊 Your Weekly Digest — {repostCount} reposts, {bcBalance} BC...", timing: "Monday 9 AM UTC", per_user: "1×/week", day_offset: 7, day_span: 1 },
    ],
  },
  {
    id: "clipper-notifications",
    config_key: "engagement_clipper_notifications",
    campaign: "Clipper Economy — Notifications",
    icon: <Trophy className="w-4 h-4 text-yellow-400" />,
    description: "Event-driven emails when a clip is approved or a bonus milestone is unlocked.",
    trigger_type: "event",
    frequency: "Per clip approval / per milestone unlock",
    edge_function: "clip-approved-notification",
    total_per_user: "Unlimited (1 per event)",
    timeline: "Instant on admin approval or milestone trigger",
    messages: [
      { id: "clip-approved", name: "Clip Approved + 100 BC", channel: "email", content_preview: "🎬 Your clip was approved! +100 BC...", timing: "Instant on approval", per_user: "1× per clip", day_offset: -1, day_span: 1 },
      { id: "clip-milestone", name: "Bonus Milestone Unlocked", channel: "email", content_preview: "🏆 Milestone unlocked: {milestone_name}! +{bonus_bc} BC", timing: "Instant on milestone", per_user: "1× per milestone", day_offset: -1, day_span: 1 },
    ],
  },
  {
    id: "tier-milestones",
    config_key: "engagement_tier_milestones",
    campaign: "Affiliate — Tier Upgrades",
    icon: <Gift className="w-4 h-4 text-fuchsia-400" />,
    description: "Congratulatory email when ambassador reaches Silver, Gold, or Diamond tier.",
    trigger_type: "event",
    frequency: "1× per tier unlock (3 possible)",
    edge_function: "send-tier-milestone-email",
    total_per_user: "Max 3 emails (Silver → Gold → Diamond)",
    timeline: "At 25 / 100 / 1,000 wristbands",
    messages: [
      { id: "tier-silver", name: "Silver Ambassador", channel: "email", content_preview: "🥈 Silver unlocked! $8,250 marketing credit.", timing: "At 25 wristbands", per_user: "1× total", day_offset: -1, day_span: 1 },
      { id: "tier-gold", name: "Gold Ambassador", channel: "email", content_preview: "🥇 Gold unlocked! $33,000 marketing credit.", timing: "At 100 wristbands", per_user: "1× total", day_offset: -1, day_span: 1 },
      { id: "tier-diamond", name: "Diamond Ambassador", channel: "email", content_preview: "💎 Diamond unlocked! $330,000 marketing credit.", timing: "At 1,000 wristbands", per_user: "1× total", day_offset: -1, day_span: 1 },
    ],
  },
  {
    id: "whatsapp-invite",
    config_key: "engagement_whatsapp_invite",
    campaign: "Viral — WhatsApp Invite",
    icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
    description: "User-initiated WhatsApp share with pre-filled referral text and wristband link.",
    trigger_type: "user_action",
    frequency: "On demand (user clicks 'Invite via WhatsApp')",
    edge_function: "send-whatsapp-invite",
    total_per_user: "Unlimited",
    timeline: "Instant on button click",
    messages: [
      { id: "wa-invite", name: "WhatsApp Referral Invite", channel: "whatsapp", content_preview: "Hey! I thought you'd appreciate this — a free gratitude wristband 🙏 {link}", timing: "Instant on action", per_user: "Unlimited", day_offset: -1, day_span: 1 },
    ],
  },
  {
    id: "gift-sms",
    config_key: "engagement_gift_sms",
    campaign: "Viral — Gift SMS",
    icon: <Send className="w-4 h-4 text-pink-400" />,
    description: "User sends a gifting SMS to a friend's phone number from the offer page or portal.",
    trigger_type: "user_action",
    frequency: "On demand (user fills gift dialog)",
    edge_function: "sms-router (templateKey: gift-invite)",
    total_per_user: "Unlimited (rate limited)",
    timeline: "Instant on form submit",
    messages: [
      { id: "gift-sms-msg", name: "Gift SMS to Friend", channel: "sms", content_preview: "Hey {friendName}! {senderName} sent you something special 🙏", timing: "Instant on send", per_user: "Unlimited", day_offset: -1, day_span: 1 },
    ],
  },
];

/* ─────────────────────── Helpers ─────────────────────── */

const channelColors: Record<string, string> = {
  sms: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  email: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  mms: "bg-green-500/15 text-green-400 border-green-500/30",
  whatsapp: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const channelBarColors: Record<string, string> = {
  sms: "bg-blue-500",
  email: "bg-purple-500",
  mms: "bg-green-500",
  whatsapp: "bg-emerald-500",
};

const triggerColors: Record<string, string> = {
  cron: "bg-amber-500/15 text-amber-400",
  event: "bg-cyan-500/15 text-cyan-400",
  user_action: "bg-pink-500/15 text-pink-400",
  webhook: "bg-red-500/15 text-red-400",
};

const triggerLabels: Record<string, string> = {
  cron: "⏰ Cron",
  event: "⚡ Event",
  user_action: "👆 User",
  webhook: "🔗 Webhook",
};

function getSummaryStats(statuses: Record<string, string>) {
  let totalMessages = 0, activeMessages = 0, pausedMessages = 0, smsCount = 0, emailCount = 0, mmsCount = 0;
  TRIGGER_GROUPS.forEach(g => {
    const isActive = (statuses[g.config_key] || "active") === "active";
    g.messages.forEach(m => {
      totalMessages++;
      if (isActive) activeMessages++; else pausedMessages++;
      if (m.channel === "sms") smsCount++;
      if (m.channel === "email") emailCount++;
      if (m.channel === "mms" || m.channel === "whatsapp") mmsCount++;
    });
  });
  return { totalMessages, activeMessages, pausedMessages, smsCount, emailCount, mmsCount, totalFlows: TRIGGER_GROUPS.length };
}

/* ─────────────────────── Gantt Timeline ─────────────────────── */

const GANTT_DAYS = 14;
const DAY_LABELS = Array.from({ length: GANTT_DAYS }, (_, i) => i === 0 ? "Signup" : `Day ${i}`);

function GanttTimeline({ statuses }: { statuses: Record<string, string> }) {
  // Collect all scheduled messages (day_offset >= 0)
  const rows: { label: string; channel: string; dayStart: number; daySpan: number; groupId: string }[] = [];
  TRIGGER_GROUPS.forEach(g => {
    const isActive = (statuses[g.config_key] || "active") === "active";
    g.messages.forEach(m => {
      if (m.day_offset >= 0 && m.day_offset < GANTT_DAYS) {
        rows.push({
          label: m.name,
          channel: m.channel,
          dayStart: m.day_offset,
          daySpan: Math.min(m.day_span, GANTT_DAYS - m.day_offset),
          groupId: isActive ? g.id : `${g.id}-paused`,
        });
      }
    });
  });

  // Recurring items (weekly): add markers at day 7
  TRIGGER_GROUPS.filter(g => g.id === "tgf-friday" || g.id === "weekly-digest").forEach(g => {
    const isActive = (statuses[g.config_key] || "active") === "active";
    if (!isActive) return;
    // Already have day 7 from data, add day 14 marker if it fits
  });

  return (
    <Card className="bg-card border-border/40 p-4 overflow-x-auto">
      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-primary" />
        User Lifecycle Timeline (First {GANTT_DAYS} Days)
      </h3>

      <div className="min-w-[700px]">
        {/* Header row */}
        <div className="flex border-b border-border/30 mb-1">
          <div className="w-[180px] shrink-0 text-[9px] text-muted-foreground uppercase tracking-wider py-1 px-2">Message</div>
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${GANTT_DAYS}, 1fr)` }}>
            {DAY_LABELS.map((d, i) => (
              <div key={i} className={`text-[8px] text-center py-1 ${i === 0 ? "text-primary font-bold" : "text-muted-foreground"} ${i % 7 === 0 && i > 0 ? "border-l border-dashed border-primary/30" : ""}`}>
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Gantt rows */}
        {rows.map((row, idx) => {
          const isPaused = row.groupId.endsWith("-paused");
          return (
            <div key={`${row.label}-${idx}`} className="flex items-center h-7 group hover:bg-secondary/10">
              <div className={`w-[180px] shrink-0 text-[10px] px-2 truncate ${isPaused ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {row.label}
              </div>
              <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${GANTT_DAYS}, 1fr)` }}>
                {/* Grid lines */}
                {Array.from({ length: GANTT_DAYS }).map((_, i) => (
                  <div key={i} className={`h-full ${i % 7 === 0 && i > 0 ? "border-l border-dashed border-primary/10" : ""}`} />
                ))}
                {/* Bar */}
                <div
                  className={`absolute top-1 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white transition-all ${isPaused ? "opacity-30" : "opacity-90"} ${channelBarColors[row.channel] || "bg-muted"}`}
                  style={{
                    left: `${(row.dayStart / GANTT_DAYS) * 100}%`,
                    width: `${(row.daySpan / GANTT_DAYS) * 100}%`,
                    minWidth: "20px",
                  }}
                >
                  <span className="truncate px-1">{row.channel.toUpperCase()}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border/20">
          {Object.entries(channelBarColors).map(([ch, cls]) => (
            <div key={ch} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <div className={`w-3 h-2 rounded-full ${cls}`} />
              {ch.toUpperCase()}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground ml-auto">
            <div className="w-6 h-2 rounded-full bg-muted opacity-30" />
            Paused
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─────────────────────── Component ─────────────────────── */

export default function EngagementBlueprintPanel() {
  const { configs, loading, getValue, saveChanges, refresh } = useCampaignConfig();
  const [togglingKeys, setTogglingKeys] = useState<Set<string>>(new Set());

  // Build statuses map from DB
  const statuses: Record<string, string> = {};
  TRIGGER_GROUPS.forEach(g => {
    statuses[g.config_key] = getValue(g.config_key, "active");
  });

  const stats = getSummaryStats(statuses);

  const handleToggle = useCallback(async (configKey: string, currentValue: string) => {
    const newValue = currentValue === "active" ? "paused" : "active";
    const group = TRIGGER_GROUPS.find(g => g.config_key === configKey);
    if (!group) return;

    setTogglingKeys(prev => new Set(prev).add(configKey));
    try {
      await saveChanges([{
        key: configKey,
        label: group.campaign,
        oldValue: currentValue,
        newValue,
        affected_areas: [],
        category: "engagement",
      }]);
      toast.success(`${group.campaign} → ${newValue === "active" ? "Activated ✅" : "Paused ⏸️"}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setTogglingKeys(prev => { const n = new Set(prev); n.delete(configKey); return n; });
    }
  }, [saveChanges]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Flows", value: stats.totalFlows, icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
            { label: "Total Msgs", value: stats.totalMessages, icon: <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> },
            { label: "Active", value: stats.activeMessages, icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "Paused", value: stats.pausedMessages, icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
            { label: "SMS", value: stats.smsCount, icon: <Smartphone className="w-3.5 h-3.5 text-blue-400" /> },
            { label: "Email", value: stats.emailCount, icon: <Mail className="w-3.5 h-3.5 text-purple-400" /> },
            { label: "MMS/WA", value: stats.mmsCount, icon: <Send className="w-3.5 h-3.5 text-green-400" /> },
          ].map(kpi => (
            <Card key={kpi.label} className="bg-card border-border/40 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {kpi.icon}
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            </Card>
          ))}
        </div>

        {/* Gantt Timeline */}
        <GanttTimeline statuses={statuses} />

        {/* Per-user lifecycle summary */}
        <Card className="bg-card border-border/40 p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Lifecycle Volume per User (Max)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
              <p className="font-semibold text-foreground">Week 1 (Onboarding)</p>
              <p className="text-muted-foreground">• 1 Welcome SMS + 1 Welcome Email</p>
              <p className="text-muted-foreground">• Up to 3 Reminders (3 PM)</p>
              <p className="text-muted-foreground">• Up to 3 Messages (11:11 AM)</p>
              <p className="text-muted-foreground">• Up to 2 Friend Collection SMS</p>
              <p className="font-bold text-primary mt-1">= Max 10 messages</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
              <p className="font-semibold text-foreground">Weekly Ongoing</p>
              <p className="text-muted-foreground">• 1 TGF Friday MMS</p>
              <p className="text-muted-foreground">• 1 Weekly Digest Email</p>
              <p className="font-bold text-primary mt-1">= 2 messages/week</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3 space-y-1">
              <p className="font-semibold text-foreground">Event-Based (Lifetime)</p>
              <p className="text-muted-foreground">• OTP: on demand (rate limited)</p>
              <p className="text-muted-foreground">• Clip Approved: 1 per clip</p>
              <p className="text-muted-foreground">• Tier Unlock: max 3 emails</p>
              <p className="text-muted-foreground">• Gift/WhatsApp: on demand</p>
              <p className="font-bold text-primary mt-1">= Variable</p>
            </div>
          </div>
        </Card>

        {/* Trigger Groups */}
        <div className="space-y-4">
          {TRIGGER_GROUPS.map(group => {
            const currentStatus = statuses[group.config_key] || "active";
            const isActive = currentStatus === "active";
            const isToggling = togglingKeys.has(group.config_key);

            return (
              <Card key={group.id} className={`bg-card border-border/40 overflow-hidden transition-opacity ${!isActive ? "opacity-60" : ""}`}>
                {/* Group Header */}
                <div className="p-4 border-b border-border/20 bg-secondary/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5">{group.icon}</div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-foreground">{group.campaign}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{group.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`${triggerColors[group.trigger_type]} text-[9px] font-mono`}>
                        {triggerLabels[group.trigger_type]}
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5">
                            {isToggling ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                            ) : (
                              <Power className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-muted-foreground"}`} />
                            )}
                            <Switch
                              checked={isActive}
                              disabled={isToggling}
                              onCheckedChange={() => handleToggle(group.config_key, currentStatus)}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                          {isActive ? "Click to pause this flow" : "Click to activate this flow"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2 text-[10px]">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span><strong className="text-foreground">Frequency:</strong> {group.frequency}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Zap className="w-3 h-3 shrink-0" />
                      <span><strong className="text-foreground">Function:</strong> <code className="text-[9px] bg-secondary/50 px-1 rounded">{group.edge_function}</code></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="w-3 h-3 shrink-0" />
                      <span><strong className="text-foreground">Per User:</strong> {group.total_per_user}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Timer className="w-3 h-3 shrink-0" />
                      <span><strong className="text-foreground">Timeline:</strong> {group.timeline}</span>
                    </div>
                  </div>
                </div>

                {/* Messages Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[9px] text-muted-foreground uppercase tracking-wider border-b border-border/10 bg-secondary/10">
                        <th className="text-left py-2 px-3 w-[22%]">Message</th>
                        <th className="text-left py-2 px-3 w-[8%]">Channel</th>
                        <th className="text-left py-2 px-3 w-[28%]">Preview</th>
                        <th className="text-left py-2 px-3 w-[18%]">Timing</th>
                        <th className="text-left py-2 px-3 w-[14%]">Per User</th>
                        <th className="text-center py-2 px-3 w-[10%]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                      {group.messages.map(msg => (
                        <tr key={msg.id} className="hover:bg-secondary/10 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-foreground">{msg.name}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className={`text-[9px] ${channelColors[msg.channel]}`}>
                              {msg.channel.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground max-w-[250px]">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate block cursor-help">{msg.content_preview}</span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-xs">
                                {msg.content_preview}
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ArrowRight className="w-3 h-3 shrink-0 text-primary/50" />
                              {msg.timing}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground font-mono text-[10px]">{msg.per_user}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 ${isActive ? "text-emerald-400" : "text-amber-400"}`}>
                              {isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              <span className="text-[9px]">{isActive ? "Active" : "Paused"}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
