import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Type, MessageSquare, Mail, Film, Share2, Search, Save, Plus, Trash2,
  ChevronDown, ChevronRight, Pencil, X, CheckCircle, RefreshCw,
} from "lucide-react";

// ─── Copy Registry: All editable copy items organized by section ───
type CopyItem = {
  key: string;
  label: string;
  section: string;
  category: string;
  description: string;
  defaultValue: string;
  affectedPages: string[];
};

const COPY_REGISTRY: CopyItem[] = [
  // ── Funnel Headlines ──
  { key: "hero_headline", label: "Landing Hero Headline", section: "funnel", category: "Headlines", description: "Main hero text on landing page (/)", defaultValue: "Feel Up to 27× Happier in 3 Days", affectedPages: ["/"] },
  { key: "hero_subheadline", label: "Landing Hero Subheadline", section: "funnel", category: "Headlines", description: "Subtitle below hero headline", defaultValue: "Neuroscience-backed gratitude hack. 100% FREE.", affectedPages: ["/"] },
  { key: "claim_cta", label: "Claim CTA Button", section: "funnel", category: "Headlines", description: "Main CTA button text", defaultValue: "🎁 Claim My FREE Wristband", affectedPages: ["/"] },
  { key: "offer111_hero", label: "$111 Pack Hero", section: "funnel", category: "Headlines", description: "Hero headline for $111 tier", defaultValue: "$111 ÷ 365 = Just $0.30 a Day to Reprogram Your Brain", affectedPages: ["/offer/111", "/offer/111-grok"] },
  { key: "offer111_sub", label: "$111 Pack Subheadline", section: "funnel", category: "Headlines", description: "Subheadline for $111 tier", defaultValue: "Your custom shirt for your best friend + 3 Neuro-Hacker Wristbands", affectedPages: ["/offer/111"] },
  { key: "offer444_hero", label: "$444 Pack Hero", section: "funnel", category: "Headlines", description: "Hero headline for $444 tier", defaultValue: "$444 ÷ 365 = $1.22/day. The Habit Lock.", affectedPages: ["/offer/444"] },
  { key: "offer1111_hero", label: "$1,111 Pack Hero", section: "funnel", category: "Headlines", description: "Hero headline for $1,111 tier", defaultValue: "The Kingdom Ambassador", affectedPages: ["/offer/1111"] },
  { key: "offer4444_hero", label: "$4,444 Pack Hero", section: "funnel", category: "Headlines", description: "Hero headline for $4,444 tier", defaultValue: "Custom Leather Jacket + Artist Patronage + NFT", affectedPages: ["/offer/4444"] },
  { key: "discount_banner", label: "Discount Banner", section: "funnel", category: "Headlines", description: "Red discount badge text", defaultValue: "77% OFF TODAY", affectedPages: ["/offer/111"] },
  { key: "gratitude_guarantee", label: "Gratitude Guarantee", section: "funnel", category: "Trust Copy", description: "Guarantee badge text", defaultValue: "Our Gratitude Guarantee: 11 meals donated in your honor", affectedPages: ["/offer/111"] },
  { key: "risk_reversal", label: "Risk Reversal Copy", section: "funnel", category: "Trust Copy", description: "Risk reversal section", defaultValue: "SSL Secured • 11 Meals Donated • FREE US Shipping", affectedPages: ["/offer/111"] },

  // ── Message Templates ──
  { key: "sms_welcome", label: "Welcome SMS", section: "messaging", category: "SMS Templates", description: "Sent when user joins the challenge", defaultValue: "🙏 Welcome to the Gratitude Challenge! Tomorrow at 11:11 AM, we'll send your first gratitude prompt. Get ready to feel 27× happier!", affectedPages: ["Challenge Setup"] },
  { key: "sms_1111", label: "11:11 AM Daily Message", section: "messaging", category: "SMS Templates", description: "Daily gratitude prompt sent at 11:11 AM", defaultValue: "🕐 11:11 — Time for gratitude! Take 11 seconds to think of {friend_name} and why you're grateful for them. Reply with your gratitude thought 🙏", affectedPages: ["Daily Automation"] },
  { key: "sms_day2_followup", label: "Day 2 Follow-up", section: "messaging", category: "SMS Templates", description: "Follow-up for Day 2", defaultValue: "Day 2! 🔥 Your gratitude streak is building. Ready for today's 11:11 moment with {friend_name}?", affectedPages: ["Followup Sequences"] },
  { key: "sms_tgf_friday", label: "TGF Friday Message", section: "messaging", category: "SMS Templates", description: "Weekly TGF (Thank God it's Friday) message", defaultValue: "🙏 TGF! Send a gratitude text to {friend_name} today. Here's a FREE wristband link to gift them: {referral_link}", affectedPages: ["TGF Automation"] },
  { key: "sms_streak_3day", label: "3-Day Streak SMS", section: "messaging", category: "SMS Templates", description: "Congratulations on 3-day streak", defaultValue: "🔥 3-DAY STREAK! You've been grateful for 3 days straight. Your mPFC is literally rewiring right now!", affectedPages: ["Streak Milestones"] },
  { key: "whatsapp_invite", label: "WhatsApp Invite Template", section: "messaging", category: "SMS Templates", description: "WhatsApp share message for inviting friends", defaultValue: "Hey! I just claimed a FREE Gratitude Wristband 🙏 You should get one too — they're backed by Harvard research: {link}", affectedPages: ["ChallengeThanks", "Portal"] },

  // ── Email Templates ──
  { key: "email_welcome_subject", label: "Welcome Email Subject", section: "emails", category: "Welcome Emails", description: "Subject line for welcome email", defaultValue: "🎁 Welcome to the Gratitude Movement!", affectedPages: ["send-welcome-email"] },
  { key: "email_welcome_body", label: "Welcome Email Preview", section: "emails", category: "Welcome Emails", description: "First paragraph of welcome email", defaultValue: "You just took the first step toward rewiring your brain for happiness. Here's what happens next...", affectedPages: ["send-welcome-email"] },
  { key: "email_expert_subject", label: "Expert Welcome Subject", section: "emails", category: "Welcome Emails", description: "Subject line for expert leads", defaultValue: "Your $3,300 Marketing Credit is Ready", affectedPages: ["send-expert-welcome"] },
  { key: "email_nm_subject", label: "Network Marketer Subject", section: "emails", category: "Welcome Emails", description: "Subject line for NM leads", defaultValue: "5 DM Scripts to Reactivate Your List This Week", affectedPages: ["send-network-marketer-welcome"] },
  { key: "email_wristband_subject", label: "Smart Wristband Welcome", section: "emails", category: "Welcome Emails", description: "Subject for wristband waitlist", defaultValue: "You're on the Smart Wristband Waitlist! 🎉", affectedPages: ["send-wristband-welcome"] },
  { key: "email_weekly_digest_subject", label: "Weekly Digest Subject", section: "emails", category: "Lifecycle Emails", description: "Weekly digest email subject line", defaultValue: "Your Weekly Gratitude Report 🙏", affectedPages: ["send-weekly-digest"] },
  { key: "email_tier_milestone", label: "Tier Milestone Email", section: "emails", category: "Lifecycle Emails", description: "Email when user reaches new affiliate tier", defaultValue: "🏆 Congratulations! You've reached {tier_name} status!", affectedPages: ["send-tier-milestone-email"] },

  // ── Clipper Copy ──
  { key: "clipper_hero", label: "Clipper Campaign Hero", section: "clipper", category: "Clipper Campaign", description: "Main headline on clipper signup page", defaultValue: "Turn 60-Second Clips Into Real Cash", affectedPages: ["/Gratitude-Clips-Challenge"] },
  { key: "clipper_sub", label: "Clipper Campaign Subheadline", section: "clipper", category: "Clipper Campaign", description: "Subheadline on clipper page", defaultValue: "Earn $2.22+ per 1,000 views. Weekly payouts every Friday.", affectedPages: ["/Gratitude-Clips-Challenge"] },
  { key: "clipper_cta", label: "Clipper CTA Button", section: "clipper", category: "Clipper Campaign", description: "Main CTA on clipper page", defaultValue: "Start Clipping & Earning →", affectedPages: ["/Gratitude-Clips-Challenge"] },
  { key: "clipper_how_step1", label: "How It Works Step 1", section: "clipper", category: "Clipper Campaign", description: "Step 1 of the clipper workflow", defaultValue: "Pick a clip from our curated library", affectedPages: ["/Gratitude-Clips-Challenge"] },
  { key: "clipper_how_step2", label: "How It Works Step 2", section: "clipper", category: "Clipper Campaign", description: "Step 2", defaultValue: "Add your CTA overlay in CapCut (60 sec tutorial)", affectedPages: ["/Gratitude-Clips-Challenge"] },
  { key: "clipper_how_step3", label: "How It Works Step 3", section: "clipper", category: "Clipper Campaign", description: "Step 3", defaultValue: "Post & earn $2.22 per 1K views", affectedPages: ["/Gratitude-Clips-Challenge"] },
  { key: "clipper_bonus_100k", label: "100K Views Bonus Copy", section: "clipper", category: "Clipper Bonuses", description: "Copy for 100K monthly bonus tier", defaultValue: "$111 Bonus — You're a Gratitude Amplifier!", affectedPages: ["/clipper-dashboard"] },
  { key: "clipper_bonus_500k", label: "500K Views Bonus Copy", section: "clipper", category: "Clipper Bonuses", description: "Copy for 500K monthly bonus tier", defaultValue: "$444 Bonus — You're a Gratitude Leader!", affectedPages: ["/clipper-dashboard"] },
  { key: "clipper_bonus_1m", label: "1M Views Bonus Copy", section: "clipper", category: "Clipper Bonuses", description: "Copy for 1M monthly bonus tier", defaultValue: "$1,111 Bonus — You're a Gratitude Legend!", affectedPages: ["/clipper-dashboard"] },

  // ── Repost / Social Share Copy ──
  { key: "repost_share_text", label: "Repost Share Text", section: "social", category: "Social Share", description: "Default text when sharing a clip repost", defaultValue: "This changed my perspective on gratitude 🙏 #IamBlessedAF", affectedPages: ["ClipperRepostGallery"] },
  { key: "share_milestone_1", label: "Share Milestone 1", section: "social", category: "Social Share", description: "Text for 1st share milestone", defaultValue: "🎉 First share! You just planted a seed of gratitude.", affectedPages: ["ShareMilestoneTracker"] },
  { key: "share_milestone_5", label: "Share Milestone 5", section: "social", category: "Social Share", description: "Text for 5th share milestone", defaultValue: "🔥 5 shares! You're officially a Gratitude Ambassador.", affectedPages: ["ShareMilestoneTracker"] },
  { key: "post_purchase_share", label: "Post-Purchase Share Prompt", section: "social", category: "Social Share", description: "Share prompt after successful purchase", defaultValue: "You just donated {meals} meals! Share the movement with friends 🙏", affectedPages: ["OfferSuccess"] },
  { key: "viral_nudge_text", label: "Viral Share Nudge", section: "social", category: "Social Share", description: "Nudge text for cross-funnel share", defaultValue: "Know someone who needs more gratitude? Gift them a FREE wristband 🎁", affectedPages: ["ViralShareNudge"] },
];

// ─── Section Tabs & Icons ───
const SECTIONS = [
  { id: "funnel", label: "Funnel Copy", icon: Type },
  { id: "messaging", label: "Messages & SMS", icon: MessageSquare },
  { id: "emails", label: "Email Templates", icon: Mail },
  { id: "clipper", label: "Clipper Copy", icon: Film },
  { id: "social", label: "Social & Repost", icon: Share2 },
];

// ─── Editable Row Component ───
function CopyRow({ item, savedValue, onSave }: { item: CopyItem; savedValue: string | null; onSave: (key: string, value: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(savedValue || item.defaultValue);
  const isModified = savedValue !== null && savedValue !== item.defaultValue;

  const handleSave = () => {
    onSave(item.key, value);
    setEditing(false);
  };

  return (
    <div className="border border-border/20 rounded-lg p-3 space-y-2 hover:border-border/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{item.label}</span>
            {isModified && <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[9px]">Modified</Badge>}
            <Badge variant="outline" className="text-[9px]">{item.category}</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
          <div className="flex gap-1 mt-1">
            {item.affectedPages.map(p => (
              <Badge key={p} variant="outline" className="text-[8px] px-1 py-0 bg-secondary/30">{p}</Badge>
            ))}
          </div>
        </div>
        <Button
          size="sm" variant="ghost" className="h-6 w-6 p-0 shrink-0"
          onClick={() => setEditing(!editing)}
        >
          {editing ? <X className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
        </Button>
      </div>

      {editing ? (
        <div className="space-y-2">
          {value.length > 80 ? (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="text-xs min-h-[60px]"
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
          <div className="flex gap-2">
            <Button size="sm" className="h-6 text-[10px] gap-1" onClick={handleSave}>
              <Save className="w-3 h-3" /> Save
            </Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => { setValue(item.defaultValue); }}>
              Reset to Default
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-foreground/80 bg-secondary/20 rounded px-2 py-1.5 font-mono">
          {savedValue || item.defaultValue}
        </p>
      )}
    </div>
  );
}

// ─── Main Copy Manager Tab ───
export default function CopyManagerTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("funnel");

  // Load saved copy from campaign_config
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

  const handleSave = async (key: string, value: string) => {
    const configKey = `copy_${key}`;
    const item = COPY_REGISTRY.find(r => r.key === key);
    const existing = savedCopy.find((c: any) => c.key === configKey);

    if (existing) {
      await supabase
        .from("campaign_config")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", configKey);
    } else {
      await supabase.from("campaign_config").insert({
        key: configKey,
        label: item?.label || key,
        value,
        category: "copy",
        description: item?.description || "",
        affected_areas: item?.affectedPages || [],
      });
    }

    qc.invalidateQueries({ queryKey: ["admin-copy-config"] });
    toast.success(`"${item?.label}" saved`);
  };

  const filteredItems = COPY_REGISTRY.filter(item => {
    const matchesSection = item.section === activeSection;
    const matchesSearch = !search || 
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.defaultValue.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesSection && matchesSearch;
  });

  // Group by category
  const categories = [...new Set(filteredItems.map(i => i.category))];

  if (isLoading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  const totalModified = COPY_REGISTRY.filter(i => getSavedValue(i.key) !== null).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card border border-border/40 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" /> Copy Manager
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Edit headlines, messages, emails, and social copy across the entire platform
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
            placeholder="Search copy items..."
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
        <TabsList className="bg-secondary/50">
          {SECTIONS.map(s => (
            <TabsTrigger key={s.id} value={s.id} className="gap-1.5 text-xs">
              <s.icon className="w-3.5 h-3.5" />
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
              <p className="text-sm text-muted-foreground text-center py-8">No copy items match your search.</p>
            ) : (
              categories.map(cat => (
                <div key={cat} className="space-y-2">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{cat}</h3>
                  <div className="space-y-2">
                    {filteredItems
                      .filter(i => i.category === cat)
                      .map(item => (
                        <CopyRow
                          key={item.key}
                          item={item}
                          savedValue={getSavedValue(item.key)}
                          onSave={handleSave}
                        />
                      ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
