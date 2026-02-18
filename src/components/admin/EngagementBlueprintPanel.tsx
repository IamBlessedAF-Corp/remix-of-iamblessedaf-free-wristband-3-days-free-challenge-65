import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  MessageSquare, Mail, Clock, Users, Zap, Calendar,
  ArrowRight, AlertTriangle, CheckCircle2, Repeat, Timer,
  Send, Bell, Gift, Heart, Trophy, Shield, Smartphone,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* ─────────────────────── Types ─────────────────────── */

interface MessageSpec {
  id: string;
  name: string;
  channel: "sms" | "email" | "mms" | "whatsapp";
  content_preview: string;
  timing: string;
  per_user: string;
  status: "active" | "paused" | "planned";
}

interface TriggerGroup {
  id: string;
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
  // ── 1. Gratitude Challenge Onboarding ──
  {
    id: "challenge-onboard",
    campaign: "Gratitude Challenge — Onboarding",
    icon: <Heart className="w-4 h-4 text-rose-400" />,
    description: "Triggered when a user signs up for the 3-day Gratitude Challenge via the setup flow.",
    trigger_type: "user_action",
    frequency: "1× per user (on signup)",
    edge_function: "schedule-challenge-messages",
    total_per_user: "1 SMS + 1 Email + up to 3 scheduled messages",
    timeline: "Immediately on signup → Day 1–3 automation",
    messages: [
      {
        id: "ch-welcome-sms",
        name: "Welcome SMS",
        channel: "sms",
        content_preview: "Hey {name}! 🙏 Your 3-Day Gratitude Challenge starts tomorrow at 11:11 AM...",
        timing: "Immediately on signup",
        per_user: "1× total",
        status: "active",
      },
      {
        id: "ch-welcome-email",
        name: "Welcome Email — \"You're early\"",
        channel: "email",
        content_preview: "You didn't scroll past. You didn't bookmark it for later. You decided.",
        timing: "Immediately on signup (called from frontend)",
        per_user: "1× total",
        status: "active",
      },
      {
        id: "ch-day1-msg",
        name: "Day 1 — 11:11 Gratitude Text",
        channel: "sms",
        content_preview: "Your personalized message to {friend_1_name}",
        timing: "Next day at 11:11 AM (user's first scheduled_send_at)",
        per_user: "1× total",
        status: "paused",
      },
      {
        id: "ch-day2-msg",
        name: "Day 2 — 11:11 Gratitude Text",
        channel: "sms",
        content_preview: "Gratitude message to {friend_2_name}",
        timing: "+2 days from signup at 11:11 AM",
        per_user: "1× (if friend_2 exists)",
        status: "paused",
      },
      {
        id: "ch-day3-msg",
        name: "Day 3 — 11:11 Gratitude Text",
        channel: "sms",
        content_preview: "Gratitude message to {friend_3_name}",
        timing: "+3 days from signup at 11:11 AM",
        per_user: "1× (if friend_3 exists)",
        status: "paused",
      },
    ],
  },

  // ── 2. Daily Reminders (3 PM) ──
  {
    id: "daily-reminders",
    campaign: "Gratitude Challenge — Daily Reminders",
    icon: <Bell className="w-4 h-4 text-amber-400" />,
    description: "Sends a 3 PM reminder the day before each scheduled 11:11 message to prompt the user to write their message.",
    trigger_type: "cron",
    frequency: "Every minute (pg_cron → send-scheduled-messages)",
    edge_function: "send-scheduled-messages",
    total_per_user: "Up to 3 reminders (1 per friend)",
    timeline: "Day 0 at 3:00 PM, Day 1 at 3:00 PM, Day 2 at 3:00 PM",
    messages: [
      {
        id: "rem-3pm",
        name: "3 PM Reminder",
        channel: "sms",
        content_preview: "Hey! Tomorrow at 11:11 AM your gratitude text to {friend_name} will be sent. Write your message now! 🙏",
        timing: "3:00 PM day before each scheduled message",
        per_user: "Up to 3 (one per friend)",
        status: "paused",
      },
    ],
  },

  // ── 3. Follow-up Friend Collection ──
  {
    id: "followup-friends",
    campaign: "Friend Collection Sequences",
    icon: <Users className="w-4 h-4 text-blue-400" />,
    description: "If user only provided 1 or 2 friends, automated follow-ups ask for additional names to extend the challenge.",
    trigger_type: "cron",
    frequency: "Every 30 minutes (pg_cron → send-followup-sequences)",
    edge_function: "send-followup-sequences",
    total_per_user: "Up to 2 SMS",
    timeline: "+2 days (Step 1: Friend 2) → +3 days (Step 2: Friend 3) at 10:00 AM",
    messages: [
      {
        id: "fu-step1",
        name: "Step 1 — Ask for Friend 2",
        channel: "sms",
        content_preview: "Who's someone who helped you when they didn't have to? Reply with their name!",
        timing: "+2 days from signup at 10:00 AM",
        per_user: "1× (only if no friend_2)",
        status: "paused",
      },
      {
        id: "fu-step2",
        name: "Step 2 — Ask for Friend 3",
        channel: "sms",
        content_preview: "Who's someone unexpected you're grateful for? Reply with their name!",
        timing: "+3 days from signup at 10:00 AM",
        per_user: "1× (only if no friend_3)",
        status: "paused",
      },
    ],
  },

  // ── 4. TGF Gratitude Fridays ──
  {
    id: "tgf-friday",
    campaign: "TGF Gratitude Fridays",
    icon: <Calendar className="w-4 h-4 text-green-400" />,
    description: "Weekly viral loop: every Friday sends a gratitude MMS to a rotating friend with a referral wristband link.",
    trigger_type: "cron",
    frequency: "Every Friday at 7:00 AM UTC",
    edge_function: "tgf-friday",
    total_per_user: "1 MMS per week (indefinite)",
    timeline: "Every Friday, forever (while opted_in_sms = true)",
    messages: [
      {
        id: "tgf-weekly",
        name: "TGF Friday MMS",
        channel: "mms",
        content_preview: "Hey {sender}! Send this gratitude message to {friend_name} with a free wristband link 🙏 [wristband image attached]",
        timing: "Every Friday at 7:00 AM UTC",
        per_user: "1× per week, rotating friends",
        status: "active",
      },
    ],
  },

  // ── 5. OTP Verification ──
  {
    id: "otp-verification",
    campaign: "Authentication — OTP",
    icon: <Shield className="w-4 h-4 text-cyan-400" />,
    description: "Sends a 6-digit code for phone or email verification. Rate limited to 10/hour/IP.",
    trigger_type: "user_action",
    frequency: "On demand (user requests login/verify)",
    edge_function: "send-otp / send-email-otp",
    total_per_user: "Unlimited (rate limited: 1 per 60s, 10 per hour per IP)",
    timeline: "Expires in 10 minutes, max 5 verification attempts",
    messages: [
      {
        id: "otp-sms",
        name: "SMS OTP Code",
        channel: "sms",
        content_preview: "Your IamBlessedAF code is: {code}. Expires in 10 minutes.",
        timing: "Instant on request",
        per_user: "Max 10/hr per IP",
        status: "active",
      },
      {
        id: "otp-email",
        name: "Email OTP Code",
        channel: "email",
        content_preview: "Your verification code: {code}",
        timing: "Instant on request",
        per_user: "Max 10/hr per IP",
        status: "active",
      },
    ],
  },

  // ── 6. Welcome Emails (Segment-specific) ──
  {
    id: "welcome-emails",
    campaign: "Lifecycle — Welcome Sequences",
    icon: <Mail className="w-4 h-4 text-purple-400" />,
    description: "Tailored welcome emails by segment. Triggered once per lead capture on respective landing pages.",
    trigger_type: "event",
    frequency: "1× per user per segment (on form submit)",
    edge_function: "send-welcome-email / send-expert-welcome / send-network-marketer-welcome / send-wristband-welcome",
    total_per_user: "1 email per segment entry",
    timeline: "Immediately on form submission",
    messages: [
      {
        id: "wel-challenge",
        name: "Challenge Welcome — \"You're early\"",
        channel: "email",
        content_preview: "You just did something most people won't. You didn't scroll past...",
        timing: "Instant on challenge signup",
        per_user: "1× total",
        status: "active",
      },
      {
        id: "wel-expert",
        name: "Expert Welcome — \"2.7x your leads\"",
        channel: "email",
        content_preview: "The wristband funnel works incredibly well in your space...",
        timing: "Instant on expert lead form",
        per_user: "1× total",
        status: "active",
      },
      {
        id: "wel-nm",
        name: "Network Marketer Welcome — DM Scripts",
        channel: "email",
        content_preview: "5 platform-specific DM ice-breaker scripts (IG, TikTok, FB, LinkedIn, WhatsApp)",
        timing: "Instant on NM lead form",
        per_user: "1× total",
        status: "active",
      },
      {
        id: "wel-wristband",
        name: "Wristband Waitlist Welcome",
        channel: "email",
        content_preview: "You're on the waitlist! 🧠🔥 FREE prototype + Kickstarter reservation links",
        timing: "Instant on waitlist signup",
        per_user: "1× total",
        status: "active",
      },
    ],
  },

  // ── 7. Weekly Digest ──
  {
    id: "weekly-digest",
    campaign: "Lifecycle — Weekly Digest",
    icon: <Repeat className="w-4 h-4 text-orange-400" />,
    description: "Weekly performance summary email sent to all affiliates/ambassadors with stats, tier progress, and BC balance.",
    trigger_type: "cron",
    frequency: "Every Monday at 9:00 AM UTC",
    edge_function: "send-weekly-digest",
    total_per_user: "1 email per week (opt-out available)",
    timeline: "Every Monday, indefinite (while digest_opted_out = false)",
    messages: [
      {
        id: "digest-weekly",
        name: "Weekly Digest Email",
        channel: "email",
        content_preview: "📊 Your Weekly Digest — {repostCount} reposts, {bcBalance} BC. Tier: {tierName}.",
        timing: "Every Monday at 9:00 AM UTC",
        per_user: "1× per week",
        status: "active",
      },
    ],
  },

  // ── 8. Clipper Notifications ──
  {
    id: "clipper-notifications",
    campaign: "Clipper Economy — Notifications",
    icon: <Trophy className="w-4 h-4 text-yellow-400" />,
    description: "Event-driven emails when a clip is approved or a bonus milestone is unlocked. Awards BC automatically.",
    trigger_type: "event",
    frequency: "Per clip approval / per milestone unlock",
    edge_function: "clip-approved-notification",
    total_per_user: "Unlimited (1 per event)",
    timeline: "Instant on admin approval or milestone trigger",
    messages: [
      {
        id: "clip-approved",
        name: "Clip Approved + 100 BC",
        channel: "email",
        content_preview: "🎬 Your clip was approved! +100 BC. Use your BC in the Rewards Store.",
        timing: "Instant on clip approval",
        per_user: "1× per approved clip",
        status: "active",
      },
      {
        id: "clip-milestone",
        name: "Bonus Milestone Unlocked",
        channel: "email",
        content_preview: "🏆 Milestone unlocked: {milestone_name}! +{bonus_bc} BC",
        timing: "Instant on milestone trigger",
        per_user: "1× per milestone",
        status: "active",
      },
    ],
  },

  // ── 9. Tier Milestone Emails ──
  {
    id: "tier-milestones",
    campaign: "Affiliate — Tier Upgrades",
    icon: <Gift className="w-4 h-4 text-fuchsia-400" />,
    description: "Congratulatory email when an ambassador reaches Silver, Gold, or Diamond tier based on wristband distribution.",
    trigger_type: "event",
    frequency: "1× per tier unlock (3 possible tiers)",
    edge_function: "send-tier-milestone-email",
    total_per_user: "Max 3 emails (Silver → Gold → Diamond)",
    timeline: "Instant when tier threshold is crossed (25 / 100 / 1,000 wristbands)",
    messages: [
      {
        id: "tier-silver",
        name: "Silver Ambassador Unlock",
        channel: "email",
        content_preview: "🥈 You've unlocked Silver Ambassador! $8,250 marketing credit.",
        timing: "At 25 wristbands distributed",
        per_user: "1× total",
        status: "active",
      },
      {
        id: "tier-gold",
        name: "Gold Ambassador Unlock",
        channel: "email",
        content_preview: "🥇 You've unlocked Gold Ambassador! $33,000 marketing credit.",
        timing: "At 100 wristbands distributed",
        per_user: "1× total",
        status: "active",
      },
      {
        id: "tier-diamond",
        name: "Diamond Ambassador Unlock",
        channel: "email",
        content_preview: "💎 You've unlocked Diamond Ambassador! $330,000 marketing credit.",
        timing: "At 1,000 wristbands distributed",
        per_user: "1× total",
        status: "active",
      },
    ],
  },

  // ── 10. WhatsApp Invite ──
  {
    id: "whatsapp-invite",
    campaign: "Viral — WhatsApp Invite",
    icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
    description: "User-initiated WhatsApp share with pre-filled referral text and wristband link.",
    trigger_type: "user_action",
    frequency: "On demand (user clicks 'Invite via WhatsApp')",
    edge_function: "send-whatsapp-invite",
    total_per_user: "Unlimited",
    timeline: "Instant on button click",
    messages: [
      {
        id: "wa-invite",
        name: "WhatsApp Referral Invite",
        channel: "whatsapp",
        content_preview: "Hey! I thought you'd appreciate this — a free gratitude wristband 🙏 {referral_link}",
        timing: "Instant on user action",
        per_user: "Unlimited",
        status: "active",
      },
    ],
  },

  // ── 11. Gift SMS ──
  {
    id: "gift-sms",
    campaign: "Viral — Gift SMS",
    icon: <Send className="w-4 h-4 text-pink-400" />,
    description: "User sends a gifting SMS to a friend's phone number from the offer page or portal.",
    trigger_type: "user_action",
    frequency: "On demand (user fills gift dialog)",
    edge_function: "sms-router (templateKey: gift-invite)",
    total_per_user: "Unlimited (rate limited)",
    timeline: "Instant on form submit",
    messages: [
      {
        id: "gift-sms-msg",
        name: "Gift SMS to Friend",
        channel: "sms",
        content_preview: "Hey {friendName}! {senderName} sent you something special — a free gratitude wristband 🙏",
        timing: "Instant on send",
        per_user: "Unlimited",
        status: "active",
      },
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

const triggerColors: Record<string, string> = {
  cron: "bg-amber-500/15 text-amber-400",
  event: "bg-cyan-500/15 text-cyan-400",
  user_action: "bg-pink-500/15 text-pink-400",
  webhook: "bg-red-500/15 text-red-400",
};

const triggerLabels: Record<string, string> = {
  cron: "⏰ Cron (Automated)",
  event: "⚡ Event-driven",
  user_action: "👆 User Action",
  webhook: "🔗 Webhook",
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  active: { icon: <CheckCircle2 className="w-3 h-3" />, color: "text-emerald-400", label: "Active" },
  paused: { icon: <AlertTriangle className="w-3 h-3" />, color: "text-amber-400", label: "Paused (A2P)" },
  planned: { icon: <Clock className="w-3 h-3" />, color: "text-muted-foreground", label: "Planned" },
};

/* ─────────────────────── Summary Stats ─────────────────────── */

function getSummaryStats() {
  let totalMessages = 0;
  let activeMessages = 0;
  let pausedMessages = 0;
  let smsCount = 0;
  let emailCount = 0;
  let mmsCount = 0;

  TRIGGER_GROUPS.forEach(g => {
    g.messages.forEach(m => {
      totalMessages++;
      if (m.status === "active") activeMessages++;
      if (m.status === "paused") pausedMessages++;
      if (m.channel === "sms") smsCount++;
      if (m.channel === "email") emailCount++;
      if (m.channel === "mms" || m.channel === "whatsapp") mmsCount++;
    });
  });

  return { totalMessages, activeMessages, pausedMessages, smsCount, emailCount, mmsCount, totalFlows: TRIGGER_GROUPS.length };
}

/* ─────────────────────── Component ─────────────────────── */

export default function EngagementBlueprintPanel() {
  const stats = getSummaryStats();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Flows", value: stats.totalFlows, icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
            { label: "Total Messages", value: stats.totalMessages, icon: <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> },
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
          {TRIGGER_GROUPS.map(group => (
            <Card key={group.id} className="bg-card border-border/40 overflow-hidden">
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
                  <Badge className={`${triggerColors[group.trigger_type]} text-[9px] font-mono shrink-0`}>
                    {triggerLabels[group.trigger_type]}
                  </Badge>
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
                      <th className="text-left py-2 px-3 w-[20%]">Message</th>
                      <th className="text-left py-2 px-3 w-[8%]">Channel</th>
                      <th className="text-left py-2 px-3 w-[30%]">Preview</th>
                      <th className="text-left py-2 px-3 w-[18%]">Timing</th>
                      <th className="text-left py-2 px-3 w-[14%]">Per User</th>
                      <th className="text-center py-2 px-3 w-[10%]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/5">
                    {group.messages.map(msg => {
                      const st = statusConfig[msg.status];
                      return (
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
                          <td className="py-2.5 px-3 text-muted-foreground flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 shrink-0 text-primary/50" />
                            <span>{msg.timing}</span>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground font-mono text-[10px]">{msg.per_user}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-flex items-center gap-1 ${st.color}`}>
                              {st.icon}
                              <span className="text-[9px]">{st.label}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
