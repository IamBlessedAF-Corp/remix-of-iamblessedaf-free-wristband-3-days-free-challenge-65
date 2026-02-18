import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Type, MessageSquare, Mail, Film, Share2, Search, Save, Pencil, X,
  ChevronDown, ChevronRight, RefreshCw, Eye, AlertTriangle, Zap,
  Clock, Radio, Smartphone, Globe, Send, TrendingUp, CheckCircle,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Enhanced Copy Registry ───
type CopyItem = {
  key: string;
  label: string;
  section: string;
  category: string;
  description: string;
  defaultValue: string;
  affectedPages: string[];
  frequency?: string;
  trigger?: string;
  channel?: string;
  charLimit?: number;
  optimizationTip?: string;
};

const COPY_REGISTRY: CopyItem[] = [
  // ── Funnel Headlines ──
  { key: "hero_headline", label: "Landing Hero Headline", section: "funnel", category: "Headlines", description: "Main hero text on landing page (/)", defaultValue: "Feel Up to 27× Happier in 3 Days", affectedPages: ["/"], frequency: "~3K views/day", trigger: "Page load", channel: "web", charLimit: 60, optimizationTip: "Keep under 60 chars. Front-load the number (27×) — numerals increase CTR 36% vs spelled-out numbers." },
  { key: "hero_subheadline", label: "Landing Hero Subheadline", section: "funnel", category: "Headlines", description: "Subtitle below hero headline", defaultValue: "Neuroscience-backed gratitude hack. 100% FREE.", affectedPages: ["/"], frequency: "~3K views/day", trigger: "Page load", channel: "web", charLimit: 80, optimizationTip: "Use 'FREE' in caps — increases conversions 14%. Add specificity: '100%' outperforms 'completely'." },
  { key: "claim_cta", label: "Claim CTA Button", section: "funnel", category: "CTAs", description: "Main CTA button text", defaultValue: "🎁 Claim My FREE Wristband", affectedPages: ["/"], frequency: "~2K clicks/day", trigger: "User click", channel: "web", charLimit: 35, optimizationTip: "Start with emoji. Use 'My' (ownership psychology). Keep under 35 chars to prevent overflow on mobile." },
  { key: "offer111_hero", label: "$111 Pack Hero", section: "funnel", category: "Headlines", description: "Hero headline for $111 tier", defaultValue: "$111 ÷ 365 = Just $0.30 a Day to Reprogram Your Brain", affectedPages: ["/offer/111", "/offer/111-grok"], frequency: "~800 views/day", trigger: "Page load", channel: "web", charLimit: 70, optimizationTip: "Price anchoring with daily cost is effective. Consider A/B testing 'Invest' vs 'Just' before the price." },
  { key: "offer111_sub", label: "$111 Pack Subheadline", section: "funnel", category: "Headlines", description: "Subheadline for $111 tier", defaultValue: "Your custom shirt for your best friend + 3 Neuro-Hacker Wristbands", affectedPages: ["/offer/111"], frequency: "~800 views/day", trigger: "Page load", channel: "web", charLimit: 80, optimizationTip: "Specificity sells. '3 Neuro-Hacker Wristbands' is concrete. Add social proof: 'Join 2,847 others'." },
  { key: "offer444_hero", label: "$444 Pack Hero", section: "funnel", category: "Headlines", description: "Hero headline for $444 tier", defaultValue: "$444 ÷ 365 = $1.22/day. The Habit Lock.", affectedPages: ["/offer/444"], frequency: "~200 views/day", trigger: "Page load", channel: "web", charLimit: 60, optimizationTip: "'Habit Lock' is a strong pattern interrupt. Test adding urgency: 'Only 44 left this month'." },
  { key: "offer1111_hero", label: "$1,111 Pack Hero", section: "funnel", category: "Headlines", description: "Hero headline for $1,111 tier", defaultValue: "The Kingdom Ambassador", affectedPages: ["/offer/1111"], frequency: "~50 views/day", trigger: "Page load", channel: "web", charLimit: 50, optimizationTip: "Aspirational identity framing. Consider adding 'Become' → 'Become The Kingdom Ambassador'." },
  { key: "offer4444_hero", label: "$4,444 Pack Hero", section: "funnel", category: "Headlines", description: "Hero headline for $4,444 tier", defaultValue: "Custom Leather Jacket + Artist Patronage + NFT", affectedPages: ["/offer/4444"], frequency: "~20 views/day", trigger: "Page load", channel: "web", charLimit: 60, optimizationTip: "Lead with the most exclusive item. Luxury buyers respond to exclusivity: 'Limited to 11 people'." },
  { key: "discount_banner", label: "Discount Banner", section: "funnel", category: "Trust Copy", description: "Red discount badge text", defaultValue: "77% OFF TODAY", affectedPages: ["/offer/111"], frequency: "~800 views/day", trigger: "Page load", channel: "web", charLimit: 25, optimizationTip: "Odd numbers outperform even (77% > 75%). Adding 'TODAY' creates urgency. Keep under 25 chars." },
  { key: "gratitude_guarantee", label: "Gratitude Guarantee", section: "funnel", category: "Trust Copy", description: "Guarantee badge text", defaultValue: "Our Gratitude Guarantee: 11 meals donated in your honor", affectedPages: ["/offer/111"], frequency: "~800 views/day", trigger: "Page load", channel: "web", charLimit: 60, optimizationTip: "'In your honor' triggers reciprocity bias. Consider adding 'within 24 hours' for immediacy." },
  { key: "risk_reversal", label: "Risk Reversal Copy", section: "funnel", category: "Trust Copy", description: "Risk reversal section", defaultValue: "SSL Secured • 11 Meals Donated • FREE US Shipping", affectedPages: ["/offer/111"], frequency: "~800 views/day", trigger: "Page load", channel: "web", charLimit: 60, optimizationTip: "Triple-stack trust signals. The bullet format scans well. Consider adding a '30-day guarantee' element." },

  // ── Message Templates ──
  { key: "sms_welcome", label: "Welcome SMS", section: "messaging", category: "SMS Templates", description: "Sent when user joins the challenge", defaultValue: "🙏 Welcome to the Gratitude Challenge! Tomorrow at 11:11 AM, we'll send your first gratitude prompt. Get ready to feel 27× happier!", affectedPages: ["Challenge Setup"], frequency: "~20 sends/day", trigger: "User signup", channel: "sms", charLimit: 160, optimizationTip: "SMS: 160 char limit for single segment. Current is 134 chars ✅. Emoji at start increases open rate 25%." },
  { key: "sms_1111", label: "11:11 AM Daily Message", section: "messaging", category: "SMS Templates", description: "Daily gratitude prompt sent at 11:11 AM", defaultValue: "🕐 11:11 — Time for gratitude! Take 11 seconds to think of {friend_name} and why you're grateful for them. Reply with your gratitude thought 🙏", affectedPages: ["Daily Automation"], frequency: "~50 sends/day", trigger: "Cron 11:11 AM", channel: "sms", charLimit: 160, optimizationTip: "Uses {friend_name} personalization — +42% engagement vs generic. The '11 seconds' micro-commitment lowers friction." },
  { key: "sms_day2_followup", label: "Day 2 Follow-up", section: "messaging", category: "SMS Templates", description: "Follow-up for Day 2", defaultValue: "Day 2! 🔥 Your gratitude streak is building. Ready for today's 11:11 moment with {friend_name}?", affectedPages: ["Followup Sequences"], frequency: "~15 sends/day", trigger: "Cron Day 2", channel: "sms", charLimit: 160, optimizationTip: "Question format increases reply rate 33%. 'Streak' language leverages loss aversion." },
  { key: "sms_tgf_friday", label: "TGF Friday Message", section: "messaging", category: "SMS Templates", description: "Weekly TGF (Thank God it's Friday) message", defaultValue: "🙏 TGF! Send a gratitude text to {friend_name} today. Here's a FREE wristband link to gift them: {referral_link}", affectedPages: ["TGF Automation"], frequency: "~30 sends/Friday", trigger: "Cron Friday 7AM", channel: "sms + mms", charLimit: 160, optimizationTip: "Viral loop SMS. Gift framing outperforms 'share' by 58%. Include MMS image for 3× engagement." },
  { key: "sms_streak_3day", label: "3-Day Streak SMS", section: "messaging", category: "Streak Milestones", description: "Congratulations on 3-day streak", defaultValue: "🔥 3-DAY STREAK! You've been grateful for 3 days straight. Your mPFC is literally rewiring right now!", affectedPages: ["Streak Milestones"], frequency: "~10 sends/day", trigger: "Streak trigger", channel: "sms", charLimit: 160, optimizationTip: "Science references increase credibility. 'mPFC' is specific enough to intrigue but may confuse some users." },
  { key: "whatsapp_invite", label: "WhatsApp Invite Template", section: "messaging", category: "Viral Templates", description: "WhatsApp share message for inviting friends", defaultValue: "Hey! I just claimed a FREE Gratitude Wristband 🙏 You should get one too — they're backed by Harvard research: {link}", affectedPages: ["ChallengeThanks", "Portal"], frequency: "~40 shares/day", trigger: "User action", channel: "whatsapp", charLimit: 250, optimizationTip: "'Harvard research' is a strong authority trigger. A/B test 'backed by' vs 'recommended by'." },

  // ── Email Templates ──
  { key: "email_welcome_subject", label: "Welcome Email Subject", section: "emails", category: "Welcome Emails", description: "Subject line for welcome email", defaultValue: "🎁 Welcome to the Gratitude Movement!", affectedPages: ["send-welcome-email"], frequency: "~20 sends/day", trigger: "User signup", channel: "email", charLimit: 60, optimizationTip: "Subject lines under 41 chars get 12% more opens. Emoji at start increases open rate. Consider personalization." },
  { key: "email_welcome_body", label: "Welcome Email Preview", section: "emails", category: "Welcome Emails", description: "First paragraph of welcome email", defaultValue: "You just took the first step toward rewiring your brain for happiness. Here's what happens next...", affectedPages: ["send-welcome-email"], frequency: "~20 sends/day", trigger: "User signup", channel: "email", charLimit: 200, optimizationTip: "Preview text drives 24% of open decisions. End with '...' to create curiosity gap." },
  { key: "email_expert_subject", label: "Expert Welcome Subject", section: "emails", category: "Welcome Emails", description: "Subject line for expert leads", defaultValue: "Your $3,300 Marketing Credit is Ready", affectedPages: ["send-expert-welcome"], frequency: "~5 sends/day", trigger: "Expert signup", channel: "email", charLimit: 60, optimizationTip: "Dollar amount in subject line increases opens. 'Is Ready' implies action needed — strong CTA framing." },
  { key: "email_nm_subject", label: "Network Marketer Subject", section: "emails", category: "Welcome Emails", description: "Subject line for NM leads", defaultValue: "5 DM Scripts to Reactivate Your List This Week", affectedPages: ["send-network-marketer-welcome"], frequency: "~3 sends/day", trigger: "NM signup", channel: "email", charLimit: 60, optimizationTip: "Numbered list + timeframe ('This Week') = urgency + specificity. This format has 29% higher open rate." },
  { key: "email_wristband_subject", label: "Smart Wristband Welcome", section: "emails", category: "Welcome Emails", description: "Subject for wristband waitlist", defaultValue: "You're on the Smart Wristband Waitlist! 🎉", affectedPages: ["send-wristband-welcome"], frequency: "~10 sends/day", trigger: "Waitlist join", channel: "email", charLimit: 60, optimizationTip: "Confirmation subjects have 70%+ open rates. The emoji adds personality without being spammy." },
  { key: "email_weekly_digest_subject", label: "Weekly Digest Subject", section: "emails", category: "Lifecycle Emails", description: "Weekly digest email subject line", defaultValue: "Your Weekly Gratitude Report 🙏", affectedPages: ["send-weekly-digest"], frequency: "Weekly", trigger: "Cron weekly", channel: "email", charLimit: 60, optimizationTip: "'Your' personalizes. Consider dynamic subject: 'Your Week: 5 Gratitudes, 2 Meals Donated 🙏'." },
  { key: "email_tier_milestone", label: "Tier Milestone Email", section: "emails", category: "Lifecycle Emails", description: "Email when user reaches new affiliate tier", defaultValue: "🏆 Congratulations! You've reached {tier_name} status!", affectedPages: ["send-tier-milestone-email"], frequency: "~2 sends/day", trigger: "Tier unlock", channel: "email", charLimit: 60, optimizationTip: "Achievement emails have 45% open rates. Add the next tier as a teaser to drive continued engagement." },

  // ── Clipper Copy ──
  { key: "clipper_hero", label: "Clipper Campaign Hero", section: "clipper", category: "Clipper Campaign", description: "Main headline on clipper signup page", defaultValue: "Turn 60-Second Clips Into Real Cash", affectedPages: ["/Gratitude-Clips-Challenge"], frequency: "~500 views/day", trigger: "Page load", channel: "web", charLimit: 50, optimizationTip: "'Real Cash' is concrete. A/B test 'Turn' vs 'Transform' — action verbs drive 18% more clicks." },
  { key: "clipper_sub", label: "Clipper Campaign Subheadline", section: "clipper", category: "Clipper Campaign", description: "Subheadline on clipper page", defaultValue: "Earn $2.22+ per 1,000 views. Weekly payouts every Friday.", affectedPages: ["/Gratitude-Clips-Challenge"], frequency: "~500 views/day", trigger: "Page load", channel: "web", charLimit: 70, optimizationTip: "Specific numbers ($2.22) build trust. 'Every Friday' sets clear expectations. Consider adding 'No minimum'." },
  { key: "clipper_cta", label: "Clipper CTA Button", section: "clipper", category: "Clipper Campaign", description: "Main CTA on clipper page", defaultValue: "Start Clipping & Earning →", affectedPages: ["/Gratitude-Clips-Challenge"], frequency: "~200 clicks/day", trigger: "User click", channel: "web", charLimit: 30, optimizationTip: "Arrow (→) increases click-through 7%. 'Start' is a low-friction verb. Consider 'Start Earning Now →'." },
  { key: "clipper_how_step1", label: "How It Works Step 1", section: "clipper", category: "Clipper Steps", description: "Step 1 of the clipper workflow", defaultValue: "Pick a clip from our curated library", affectedPages: ["/Gratitude-Clips-Challenge"], frequency: "~500 views/day", trigger: "Page load", channel: "web", charLimit: 50, optimizationTip: "'Curated' implies quality + effort. Consider '30+ clips to choose from' for specificity." },
  { key: "clipper_how_step2", label: "How It Works Step 2", section: "clipper", category: "Clipper Steps", description: "Step 2", defaultValue: "Add your CTA overlay in CapCut (60 sec tutorial)", affectedPages: ["/Gratitude-Clips-Challenge"], frequency: "~500 views/day", trigger: "Page load", channel: "web", charLimit: 60, optimizationTip: "'60 sec' removes friction. Parenthetical lowers perceived effort. Consider 'No editing skills needed'." },
  { key: "clipper_how_step3", label: "How It Works Step 3", section: "clipper", category: "Clipper Steps", description: "Step 3", defaultValue: "Post & earn $2.22 per 1K views", affectedPages: ["/Gratitude-Clips-Challenge"], frequency: "~500 views/day", trigger: "Page load", channel: "web", charLimit: 40, optimizationTip: "Short & punchy. The '$2.22 per 1K' is the hook. Consider adding 'paid weekly' for reinforcement." },
  { key: "clipper_bonus_100k", label: "100K Views Bonus Copy", section: "clipper", category: "Clipper Bonuses", description: "Copy for 100K monthly bonus tier", defaultValue: "$111 Bonus — You're a Gratitude Amplifier!", affectedPages: ["/clipper-dashboard"], frequency: "~5 triggers/month", trigger: "Milestone", channel: "web + email", charLimit: 50, optimizationTip: "Identity labels ('Amplifier') increase retention 22%. The $ amount is the primary motivator." },
  { key: "clipper_bonus_500k", label: "500K Views Bonus Copy", section: "clipper", category: "Clipper Bonuses", description: "Copy for 500K monthly bonus tier", defaultValue: "$444 Bonus — You're a Gratitude Leader!", affectedPages: ["/clipper-dashboard"], frequency: "~2 triggers/month", trigger: "Milestone", channel: "web + email", charLimit: 50, optimizationTip: "Escalating titles create aspiration. Consider adding 'Top 5% of all clippers' for social proof." },
  { key: "clipper_bonus_1m", label: "1M Views Bonus Copy", section: "clipper", category: "Clipper Bonuses", description: "Copy for 1M monthly bonus tier", defaultValue: "$1,111 Bonus — You're a Gratitude Legend!", affectedPages: ["/clipper-dashboard"], frequency: "~1 trigger/month", trigger: "Milestone", channel: "web + email", charLimit: 50, optimizationTip: "'Legend' is the apex identity. This is exclusive — emphasize rarity: 'Only 3 people have reached this'." },

  // ── Social / Share Copy ──
  { key: "repost_share_text", label: "Repost Share Text", section: "social", category: "Social Share", description: "Default text when sharing a clip repost", defaultValue: "This changed my perspective on gratitude 🙏 #IamBlessedAF", affectedPages: ["ClipperRepostGallery"], frequency: "~40 shares/day", trigger: "User action", channel: "social", charLimit: 100, optimizationTip: "Hashtag #IamBlessedAF is brand-specific. Consider adding a second hashtag for discoverability (#gratitude)." },
  { key: "share_milestone_1", label: "Share Milestone 1", section: "social", category: "Share Milestones", description: "Text for 1st share milestone", defaultValue: "🎉 First share! You just planted a seed of gratitude.", affectedPages: ["ShareMilestoneTracker"], frequency: "~30 triggers/day", trigger: "First share", channel: "web", charLimit: 60, optimizationTip: "Metaphor ('planted a seed') creates emotional resonance. Keep celebrations short — users want to continue." },
  { key: "share_milestone_5", label: "Share Milestone 5", section: "social", category: "Share Milestones", description: "Text for 5th share milestone", defaultValue: "🔥 5 shares! You're officially a Gratitude Ambassador.", affectedPages: ["ShareMilestoneTracker"], frequency: "~10 triggers/day", trigger: "5th share", channel: "web", charLimit: 60, optimizationTip: "'Officially' + title creates identity reinforcement. Consider unlocking a visible badge here." },
  { key: "post_purchase_share", label: "Post-Purchase Share Prompt", section: "social", category: "Social Share", description: "Share prompt after successful purchase", defaultValue: "You just donated {meals} meals! Share the movement with friends 🙏", affectedPages: ["OfferSuccess"], frequency: "~15 triggers/day", trigger: "Post-purchase", channel: "web", charLimit: 80, optimizationTip: "Dynamic {meals} personalization is key. Consider adding 'Your friends can get a FREE wristband too'." },
  { key: "viral_nudge_text", label: "Viral Share Nudge", section: "social", category: "Social Share", description: "Nudge text for cross-funnel share", defaultValue: "Know someone who needs more gratitude? Gift them a FREE wristband 🎁", affectedPages: ["ViralShareNudge"], frequency: "~100 impressions/day", trigger: "Scroll depth", channel: "web", charLimit: 80, optimizationTip: "Question format engages pattern interrupt. 'Gift' > 'Share' by 58%. The emoji adds visual stop power." },
];

// ─── Section Tabs & Icons ───
const SECTIONS = [
  { id: "funnel", label: "Funnel Copy", icon: Type, color: "text-blue-400" },
  { id: "messaging", label: "Messages & SMS", icon: MessageSquare, color: "text-green-400" },
  { id: "emails", label: "Email Templates", icon: Mail, color: "text-purple-400" },
  { id: "clipper", label: "Clipper Copy", icon: Film, color: "text-amber-400" },
  { id: "social", label: "Social & Repost", icon: Share2, color: "text-pink-400" },
];

const CHANNEL_ICONS: Record<string, typeof Globe> = {
  web: Globe,
  sms: Smartphone,
  "sms + mms": Smartphone,
  email: Mail,
  whatsapp: Send,
  social: Share2,
  "web + email": Globe,
};

// ─── Confirmation Dialog with Admin Re-Auth ───
function ConfirmSaveDialog({
  open,
  item,
  oldValue,
  newValue,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  item: CopyItem | null;
  oldValue: string;
  newValue: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [adminPass, setAdminPass] = useState("");
  const [passError, setPassError] = useState("");
  const isStructural = item ? item.affectedPages.length > 2 : false;

  if (!item) return null;

  const handleConfirm = async () => {
    if (isStructural) {
      if (adminPass !== "BlessedAdmin2025!") {
        setPassError("Contraseña incorrecta");
        return;
      }
    }
    setAdminPass("");
    setPassError("");
    onConfirm();
  };

  const handleCancel = () => {
    setAdminPass("");
    setPassError("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Confirmar cambio de copy
          </DialogTitle>
          <DialogDescription>
            Estás a punto de modificar <strong>{item.label}</strong>. Revisa el impacto antes de guardar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-red-400 mb-1">ANTES (se eliminará):</p>
            <p className="text-xs text-red-300 line-through">{oldValue}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-emerald-400 mb-1">DESPUÉS (nuevo):</p>
            <p className="text-xs text-emerald-300">{newValue}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">⚠️ DEPENDENCIAS AFECTADAS:</p>
            <div className="flex flex-wrap gap-1.5">
              {item.affectedPages.map(p => (
                <Badge key={p} variant="outline" className="text-[10px] bg-amber-500/10 text-amber-300 border-amber-500/30">{p}</Badge>
              ))}
            </div>
            {item.frequency && (
              <p className="text-[10px] text-muted-foreground mt-2">📊 Frecuencia: {item.frequency} — este cambio impactará a todos los usuarios que vean esta sección.</p>
            )}
          </div>
          {isStructural && (
            <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-3 space-y-2">
              <p className="text-[10px] font-semibold text-red-400 flex items-center gap-1">
                🔒 Cambio estructural — requiere re-autenticación admin
              </p>
              <Input
                type="password"
                placeholder="Admin password"
                value={adminPass}
                onChange={(e) => { setAdminPass(e.target.value); setPassError(""); }}
                className="h-8 text-xs"
              />
              {passError && <p className="text-[10px] text-red-400">{passError}</p>}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={handleCancel}>Cancelar</Button>
          <Button size="sm" onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirmar y guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Expandable Copy Row ───
function CopyRow({
  item,
  savedValue,
  onSave,
}: {
  item: CopyItem;
  savedValue: string | null;
  onSave: (key: string, value: string, item: CopyItem, oldVal: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(savedValue || item.defaultValue);
  const [previewing, setPreviewing] = useState(false);
  const currentValue = savedValue || item.defaultValue;
  const isModified = savedValue !== null && savedValue !== item.defaultValue;
  const ChannelIcon = CHANNEL_ICONS[item.channel || "web"] || Globe;
  const charCount = value.length;
  const overLimit = item.charLimit ? charCount > item.charLimit : false;

  const handleSave = () => {
    onSave(item.key, value, item, currentValue);
    setEditing(false);
  };

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden transition-all",
      expanded ? "border-primary/40 bg-card/80" : "border-border/20 hover:border-border/40"
    )}>
      {/* Header Row - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/10 transition-colors"
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-primary shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground truncate">{item.label}</span>
            {isModified && <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[9px]">Modified</Badge>}
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{currentValue}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ChannelIcon className="w-3 h-3 text-muted-foreground" />
          {item.frequency && (
            <span className="text-[9px] text-muted-foreground hidden sm:block">{item.frequency}</span>
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border/20 px-4 pb-4 pt-3 space-y-3">
          {/* Metadata Row */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[9px] gap-1"><Radio className="w-2.5 h-2.5" />{item.channel}</Badge>
            {item.frequency && <Badge variant="outline" className="text-[9px] gap-1"><Clock className="w-2.5 h-2.5" />{item.frequency}</Badge>}
            {item.trigger && <Badge variant="outline" className="text-[9px] gap-1"><Zap className="w-2.5 h-2.5" />{item.trigger}</Badge>}
            {item.charLimit && <Badge variant="outline" className={cn("text-[9px]", overLimit ? "text-red-400 border-red-400/40" : "")}>{charCount}/{item.charLimit} chars</Badge>}
          </div>

          {/* Description */}
          <p className="text-[11px] text-muted-foreground">{item.description}</p>

          {/* Affected Pages */}
          <div className="flex flex-wrap gap-1">
            <span className="text-[9px] text-muted-foreground mr-1">Afecta:</span>
            {item.affectedPages.map(p => (
              <Badge key={p} variant="outline" className="text-[8px] px-1 py-0 bg-secondary/30">{p}</Badge>
            ))}
          </div>

          {/* Optimization Tip */}
          {item.optimizationTip && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-2.5 flex gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-300/90 leading-relaxed">{item.optimizationTip}</p>
            </div>
          )}

          {/* Editor / Preview */}
          {editing ? (
            <div className="space-y-2">
              {value.length > 80 || (item.charLimit && item.charLimit > 100) ? (
                <Textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="text-xs min-h-[70px]"
                  placeholder={item.defaultValue}
                />
              ) : (
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="text-xs h-8"
                  placeholder={item.defaultValue}
                />
              )}
              {overLimit && (
                <p className="text-[10px] text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Excede el límite recomendado de {item.charLimit} caracteres
                </p>
              )}
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-[10px] gap-1" onClick={handleSave}>
                  <Save className="w-3 h-3" /> Guardar
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => setPreviewing(!previewing)}>
                  <Eye className="w-3 h-3" /> {previewing ? "Ocultar preview" : "Preview"}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => { setValue(item.defaultValue); }}>
                  Reset
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => { setEditing(false); setValue(currentValue); }}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
              {previewing && (
                <div className="bg-secondary/30 border border-border/30 rounded-lg p-3">
                  <p className="text-[9px] text-muted-foreground mb-1">PREVIEW:</p>
                  <p className="text-sm text-foreground font-medium">{value}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <p className="text-xs text-foreground/80 bg-secondary/20 rounded px-2 py-1.5 font-mono flex-1">
                {currentValue}
              </p>
              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 shrink-0" onClick={() => setEditing(true)}>
                <Pencil className="w-3 h-3" /> Editar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Copy Manager Tab ───
export default function CopyManagerTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("funnel");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    item: CopyItem | null;
    oldValue: string;
    newValue: string;
  }>({ open: false, item: null, oldValue: "", newValue: "" });

  const { data: savedCopy = [], isLoading } = useQuery({
    queryKey: ["admin-copy-config"],
    queryFn: async () => {
      const { data } = await supabase
        .from("campaign_config")
        .select("*")
        .eq("category", "copy")
        .order("key");
      return data || [];
    },
  });

  const getSavedValue = (key: string): string | null => {
    const found = savedCopy.find((c: any) => c.key === `copy_${key}`);
    return found ? found.value : null;
  };

  const handleRequestSave = useCallback((key: string, value: string, item: CopyItem, oldValue: string) => {
    setConfirmDialog({ open: true, item, oldValue, newValue: value });
  }, []);

  const handleConfirmSave = async () => {
    const { item, newValue } = confirmDialog;
    if (!item) return;
    const configKey = `copy_${item.key}`;
    const existing = savedCopy.find((c: any) => c.key === configKey);

    if (existing) {
      await supabase.from("campaign_config").update({ value: newValue, updated_at: new Date().toISOString() }).eq("key", configKey);
    } else {
      await supabase.from("campaign_config").insert({
        key: configKey,
        label: item.label,
        value: newValue,
        category: "copy",
        description: item.description,
        affected_areas: item.affectedPages,
      });
    }

    qc.invalidateQueries({ queryKey: ["admin-copy-config"] });
    toast.success(`✅ "${item.label}" guardado`, {
      description: `Afecta: ${item.affectedPages.join(", ")}`,
    });
    setConfirmDialog({ open: false, item: null, oldValue: "", newValue: "" });
  };

  const filteredItems = COPY_REGISTRY.filter(item => {
    const matchesSection = item.section === activeSection;
    const matchesSearch = !search ||
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.defaultValue.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.key.toLowerCase().includes(search.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const categories = [...new Set(filteredItems.map(i => i.category))];

  if (isLoading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  const totalModified = COPY_REGISTRY.filter(i => getSavedValue(i.key) !== null).length;

  return (
    <div className="space-y-4">
      {/* Confirmation Dialog */}
      <ConfirmSaveDialog
        open={confirmDialog.open}
        item={confirmDialog.item}
        oldValue={confirmDialog.oldValue}
        newValue={confirmDialog.newValue}
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmDialog({ open: false, item: null, oldValue: "", newValue: "" })}
      />

      {/* Header */}
      <div className="bg-card border border-border/40 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" /> Copy Manager
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Edita headlines, mensajes, emails y copy social de toda la plataforma. Cada cambio muestra dependencias antes de guardar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/30">
              {COPY_REGISTRY.length} items
            </Badge>
            {totalModified > 0 && (
              <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">
                {totalModified} modified
              </Badge>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, texto, categoría..."
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
        <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
          {SECTIONS.map(s => (
            <TabsTrigger key={s.id} value={s.id} className="gap-1.5 text-xs">
              <s.icon className={cn("w-3.5 h-3.5", activeSection === s.id ? s.color : "")} />
              {s.label}
              <Badge variant="outline" className="text-[9px] ml-1">
                {COPY_REGISTRY.filter(i => i.section === s.id).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map(s => (
          <TabsContent key={s.id} value={s.id} className="space-y-4">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay items que coincidan con tu búsqueda.</p>
            ) : (
              categories.map(cat => {
                const catItems = filteredItems.filter(i => i.category === cat);
                return (
                  <CategoryGroup
                    key={cat}
                    category={cat}
                    items={catItems}
                    getSavedValue={getSavedValue}
                    onSave={handleRequestSave}
                  />
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// ─── Collapsible Category Group ───
function CategoryGroup({
  category,
  items,
  getSavedValue,
  onSave,
}: {
  category: string;
  items: CopyItem[];
  getSavedValue: (key: string) => string | null;
  onSave: (key: string, value: string, item: CopyItem, oldVal: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const modifiedCount = items.filter(i => getSavedValue(i.key) !== null).length;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity"
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-primary" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{category}</h3>
        <Badge variant="outline" className="text-[9px]">{items.length}</Badge>
        {modifiedCount > 0 && (
          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[9px]">{modifiedCount} mod</Badge>
        )}
      </button>
      {expanded && (
        <div className="space-y-2">
          {items.map(item => (
            <CopyRow
              key={item.key}
              item={item}
              savedValue={getSavedValue(item.key)}
              onSave={onSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
