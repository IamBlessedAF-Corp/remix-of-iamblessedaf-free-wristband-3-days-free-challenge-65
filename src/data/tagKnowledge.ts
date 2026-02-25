import {
  Clock, Radio, Zap, Smartphone, Globe, Mail, Send, Share2,
  TrendingUp, Box, Tag, type LucideIcon,
} from "lucide-react";

// ─── Tag knowledge base ───
export interface TagInfo {
  explanation: string;
  editable?: { label: string; field: string }[];
}

export function getTagInfo(tag: string): TagInfo {
  const t = tag.toLowerCase().trim();

  // ─── Channel tags ───
  if (t === "sms") return { explanation: "Text message via Twilio. Limit: 160 chars per segment.", editable: [{ label: "Channel", field: "channel" }] };
  if (t === "sms + mms") return { explanation: "Multimedia message (text + image) via Twilio. Higher engagement (+3×) but higher cost.", editable: [{ label: "Channel", field: "channel" }] };
  if (t === "email") return { explanation: "Transactional or marketing email via Resend. Average open rate: 35-45%.", editable: [{ label: "Channel", field: "channel" }] };
  if (t === "whatsapp") return { explanation: "WhatsApp message via Twilio. Requires Meta-approved template.", editable: [{ label: "Channel", field: "channel" }] };
  if (t === "web") return { explanation: "Text displayed directly in the web interface. Updates in real time.", editable: [] };
  if (t === "web + email") return { explanation: "Text shown on web AND sent via email. Changes affect both channels.", editable: [] };
  if (t === "social") return { explanation: "Text for social media (Twitter, IG, TikTok). Copied to clipboard.", editable: [] };

  // ─── Block Categories ───
  if (t === "content") return { explanation: "Editorial content block: quotes, research, storytelling.", editable: [] };
  if (t === "product") return { explanation: "Product block: shows wristbands, shirts, or bundles with galleries and pricing.", editable: [] };
  if (t === "cta") return { explanation: "Call-to-Action: primary conversion button.", editable: [] };
  if (t === "hero") return { explanation: "Hero section: visitor's first impression. High impact on bounce rate.", editable: [] };
  if (t === "trust") return { explanation: "Trust block: testimonials, guarantees, credibility signals.", editable: [] };
  if (t === "urgency") return { explanation: "Urgency block: timers, stock counters, exit-intent modals.", editable: [] };
  if (t === "viral") return { explanation: "Viral block: share nudges, impact counters, gamification.", editable: [] };
  if (t === "value stack") return { explanation: "Value Stack: visual list of benefits with crossed-out price.", editable: [] };
  if (t === "system") return { explanation: "Component connected to real-time data. Updates automatically.", editable: [] };

  // ─── Live value patterns ───
  if (t.includes("orders")) return { explanation: "Orders registered in the database.", editable: [] };
  if (t.includes("quotes") || t.includes("variants")) return { explanation: "Multiple copy variants for A/B testing.", editable: [] };
  if (t.includes("multiplier") || t.includes("×")) return { explanation: "Impact figure based on the Hawkins scale.", editable: [] };
  if (t.includes("clips")) return { explanation: "Clips in this category. Verified automatically.", editable: [] };
  if (t.includes("clippers")) return { explanation: "Content creators registered in the program.", editable: [] };
  if (t.includes("segments")) return { explanation: "Active budget segments.", editable: [] };
  if (t.includes("cycle")) return { explanation: "Current budget cycle status.", editable: [] };

  // ─── Frequency patterns ───
  if (t.includes("sends/day") || t.includes("send/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} messages/day. Average volume over last 7 days.`, editable: [{ label: "Daily frequency", field: "frequency" }] };
  }
  if (t.includes("sends/friday") || t.includes("send/friday")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} messages every Friday (TGF program).`, editable: [{ label: "Weekly frequency", field: "frequency" }] };
  }
  if (t.includes("views/day") || t.includes("view/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} views/day. Changes here impact high volume.`, editable: [] };
  }
  if (t.includes("clicks/day") || t.includes("click/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} clicks/day. High engagement indicates effective copy.`, editable: [] };
  }
  if (t.includes("shares/day") || t.includes("share/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} shares/day. Each share amplifies organic reach.`, editable: [] };
  }
  if (t.includes("impressions/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} impressions/day. Scroll-depth triggered.`, editable: [] };
  }
  if (t.includes("triggers/day") || t.includes("trigger/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} activations/day.`, editable: [] };
  }
  if (t.includes("triggers/month") || t.includes("trigger/month")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} activations/month. Rare event — high value.`, editable: [] };
  }
  if (t === "weekly") return { explanation: "Sent once per week. Day and time configurable.", editable: [{ label: "Send day", field: "day" }, { label: "Send time", field: "time" }] };

  // ─── Trigger patterns ───
  if (t.includes("cron")) {
    const timeMatch = t.match(/cron\s+(.*)/i)?.[1] || t;
    return { explanation: `Automated scheduled task: ${timeMatch}.`, editable: [{ label: "Schedule", field: "schedule" }] };
  }
  if (t === "page load") return { explanation: "Shown on page load. Optimize for immediate impact.", editable: [] };
  if (t === "user click") return { explanation: "Triggered by user click. Intent-driven.", editable: [] };
  if (t === "user action") return { explanation: "Triggered by user action (share, invite, etc.).", editable: [] };
  if (t === "user signup") return { explanation: "Fires on new user signup. Open rate ~70%.", editable: [] };
  if (t === "post-purchase") return { explanation: "After successful purchase. Ideal moment for viralization.", editable: [] };
  if (t === "scroll depth") return { explanation: "Appears at ~60-70% scroll depth. Indicates real interest.", editable: [{ label: "Depth (%)", field: "scroll_depth" }] };
  if (t === "exit-intent") return { explanation: "Fires when cursor exits viewport or inactive for 30s.", editable: [{ label: "Delay (sec)", field: "exit_delay" }] };
  if (t.includes("streak trigger")) return { explanation: "Fires when a streak milestone is reached.", editable: [] };
  if (t.includes("milestone")) return { explanation: "Triggered by views or engagement milestone.", editable: [] };
  if (t.includes("tier unlock")) return { explanation: "Fires on affiliate tier upgrade.", editable: [] };
  if (t.includes("first share")) return { explanation: "User's first share ever.", editable: [] };
  if (t.includes("5th share")) return { explanation: "5th share — reinforces 'Ambassador' identity.", editable: [] };
  if (t.includes("expert signup")) return { explanation: "Expert/influencer signup. High-value channel.", editable: [] };
  if (t.includes("nm signup")) return { explanation: "Network Marketer signup.", editable: [] };
  if (t.includes("waitlist join")) return { explanation: "Smart Wristband waitlist join.", editable: [] };

  // ─── Char count patterns ───
  if (t.includes("/") && t.includes("chars")) {
    const parts = t.match(/(\d+)\s*\/\s*(\d+)/);
    if (parts) {
      const current = parseInt(parts[1]);
      const limit = parseInt(parts[2]);
      const pct = Math.round((current / limit) * 100);
      return { explanation: `${current}/${limit} chars (${pct}%). ${pct > 90 ? "⚠️ Near limit." : pct > 70 ? "Good use of space." : "Space available."}`, editable: [{ label: "Limit", field: "charLimit" }] };
    }
  }

  // ─── Numeric-only values ───
  if (/^\d+$/.test(t)) return { explanation: `Current real-time value: ${t}.`, editable: [] };

  // ─── Generic fallback ───
  return { explanation: `"${tag}" — Classification metadata.`, editable: [] };
}

// ─── Tag icon mapping ───
const TAG_ICONS: Record<string, LucideIcon> = {
  sms: Smartphone, "sms + mms": Smartphone, email: Mail, whatsapp: Send,
  web: Globe, "web + email": Globe, social: Share2,
  content: Box, product: Box, cta: Tag, hero: Tag, trust: Tag,
  urgency: Clock, viral: TrendingUp, "value stack": Tag, system: Zap,
};

export function getTagIcon(tag: string): LucideIcon {
  const t = tag.toLowerCase().trim();
  if (TAG_ICONS[t]) return TAG_ICONS[t];
  if (t.includes("sends") || t.includes("views") || t.includes("clicks") || t.includes("shares") || t.includes("impressions") || t.includes("triggers") || t === "weekly") return TrendingUp;
  if (t.includes("cron") || t === "page load" || t.includes("signup") || t.includes("purchase") || t.includes("trigger") || t.includes("milestone") || t.includes("share") || t.includes("intent") || t.includes("scroll") || t === "user click" || t === "user action") return Zap;
  if (t.includes("chars")) return Clock;
  if (t.includes("orders") || t.includes("clips") || t.includes("clippers")) return TrendingUp;
  if (/^\d+$/.test(t)) return TrendingUp;
  return Radio;
}
