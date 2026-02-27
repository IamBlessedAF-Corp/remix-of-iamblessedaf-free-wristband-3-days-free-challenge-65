import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── TRAFFIC TYPES ───
const VALID_LANES = ["otp", "transactional", "marketing"] as const;
type TrafficType = (typeof VALID_LANES)[number];

// ─── MARKETING KEYWORD BLOCKLIST (blocked in transactional lane) ───
const MARKETING_KEYWORDS = [
  "sale", "discount", "% off", "coupon", "offer",
  "buy now", "limited time deal", "promo", "flash sale",
  "free shipping", "clearance", "deal of", "save $",
];

// ─── TEMPLATE REGISTRY ───
interface SmsTemplate {
  lane: TrafficType;
  body: string;
  requiresStopLanguage: boolean;
  complianceFlags: string[];
}

const TEMPLATE_REGISTRY: Record<string, SmsTemplate> = {
  // ── OTP ──
  "otp-login": {
    lane: "otp",
    body: "Your I am Blessed AF verification code is: {{code}}. Do not share this code. Expires in 10 minutes.",
    requiresStopLanguage: false,
    complianceFlags: ["no-marketing", "security-only"],
  },
  "otp-password-reset": {
    lane: "otp",
    body: "Your I am Blessed AF password reset code is: {{code}}. If you didn't request this, ignore this message.",
    requiresStopLanguage: false,
    complianceFlags: ["no-marketing", "security-only"],
  },

  // ── TRANSACTIONAL ──
  "challenge-welcome": {
    lane: "transactional",
    body: "🙏 Welcome to the I am Blessed AF 3-Day Gratitude Challenge!\n\nYour challenge starts tomorrow at 11:11 AM.\nDay 1 message goes to {{friendName}}.\n\nWe'll text you at 3PM today to help you prepare.\n\nReply STOP to opt out.\n— I am Blessed AF",
    requiresStopLanguage: true,
    complianceFlags: ["engagement", "onboarding"],
  },
  "challenge-reminder-3pm": {
    lane: "transactional",
    body: "🙏 Hey! Tomorrow is Day {{dayNumber}} of your Gratitude Challenge.\n\nYour 11:11 message goes to {{friendName}}.\n\nWhat moment are you grateful for? Reply with your memory and we'll format your message!\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "reminder"],
  },
  "challenge-1111-send": {
    lane: "transactional",
    body: "It's 11:11! 🙏 Time to send your gratitude to {{friendName}}.\n\nHere's your message:\n\n\"{{messageBody}}\"\n\nCopy and send it now! Reply DONE when sent. 🧠\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "action-prompt"],
  },
  "tgf-friday": {
    lane: "transactional",
    body: "🙏 TGF — Thank God it's Friday!\n\nHey {{senderName}}, it's Gratitude Friday!\n\nThis week's mission: Send a quick \"Thank You\" to {{friendName}}.\n\nHere's a message you can forward:\n\n\"Hey {{friendName}} Thank You! 🙏\nGot you this wristband, get it shipped with your address here:\n{{referralLink}}\"\n\nSpread the gratitude! 💛\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "weekly-mission"],
  },
  "challenge-streak-update": {
    lane: "transactional",
    body: "🔥 {{streakCount}}-day streak! You're on fire, {{name}}. Keep the gratitude flowing tomorrow at 11:11.\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "progress"],
  },
  "challenge-completion": {
    lane: "transactional",
    body: "🎉 You completed the 3-Day Gratitude Challenge! {{name}}, you've sent love to {{friendCount}} friends.\n\nYour gratitude ripple is real. 🌊\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "milestone"],
  },

  // ── JOY KEYS ENGINE ──
  "joy-key0-activated": {
    lane: "transactional",
    body: "🔑 Key 0 UNLOCKED! {{name}}, you just activated your Joy Keys journey.\n\n+50 Blessed Coins earned.\n\nNext unlock: Share your clip or referral link → Key 1 (100 BC)\n\nhttps://iamblessedaf.com/keys\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "joy-keys", "onboarding"],
  },
  "joy-key1-reminder": {
    lane: "transactional",
    body: "🔑 Hey {{name}}! Key 1 is waiting for you.\n\nShare your clip or referral link to unlock it → +100 Blessed Coins.\n\nYou're {{percentage}}% there to FREE shipping.\n\nhttps://iamblessedaf.com/keys\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "joy-keys", "nudge"],
  },
  "joy-key1-unlocked": {
    lane: "transactional",
    body: "🔑🔑 Key 1 UNLOCKED! {{name}}, your clip/referral is spreading gratitude.\n\n+100 Blessed Coins earned. Total: {{totalCoins}} BC.\n\nNext: Share your story → Key 2 (150 BC)\n\nhttps://iamblessedaf.com/challenge/story\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "joy-keys", "milestone"],
  },
  "joy-key2-story-nudge": {
    lane: "transactional",
    body: "🔑 {{name}}, Key 2 is calling! Share your gratitude story to unlock it.\n\nTakes 30 seconds — screenshot your story and share on WhatsApp/IG.\n\n+150 Blessed Coins waiting for you.\n\nhttps://iamblessedaf.com/challenge/story\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "joy-keys", "nudge"],
  },
  "joy-key2-unlocked": {
    lane: "transactional",
    body: "🔑🔑🔑 Key 2 UNLOCKED! {{name}}, your story is inspiring others.\n\n+150 Blessed Coins earned. Total: {{totalCoins}} BC.\n\nFinal key: Invite 3 friends → Key 3 (200 BC each!)\n\nhttps://iamblessedaf.com/challenge/invite\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "joy-keys", "milestone"],
  },
  "joy-key3-invite-reminder": {
    lane: "transactional",
    body: "🔑 {{name}}, you need {{friendsNeeded}} more friend(s) to unlock Key 3!\n\nEach friend who joins = +200 BC for you + 50 BC for them.\n\nShare your invite link:\n{{inviteLink}}\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "joy-keys", "nudge"],
  },
  "joy-key3-unlocked": {
    lane: "transactional",
    body: "🔑🔑🔑🔑 Key 3 UNLOCKED! {{name}}, 3 friends joined thanks to you!\n\n+600 Blessed Coins earned from referrals.\n\n🏆 ALL 4 KEYS COMPLETE → Master Key checking...\n\nhttps://iamblessedaf.com/keys\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "joy-keys", "milestone"],
  },
  "joy-master-key-unlocked": {
    lane: "transactional",
    body: "🏆✨ MASTER KEY UNLOCKED! {{name}}, you did it!\n\nYou've earned FREE shipping on your Neuro-Hacker wristband + 500 bonus Blessed Coins.\n\nTotal: {{totalCoins}} BC.\n\nClaim your reward now:\nhttps://iamblessedaf.com/offer/wristband\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "joy-keys", "master-key", "milestone"],
  },
  "joy-stalled-24h": {
    lane: "transactional",
    body: "🔑 {{name}}, your Joy Keys are {{percentage}}% complete!\n\nYou're stuck on Key {{currentKey}}. Here's what to do next:\n\n{{nextAction}}\n\nDon't let your Blessed Coins expire. Keep going!\n\nhttps://iamblessedaf.com/keys\n\n— I am Blessed AF",
    requiresStopLanguage: false,
    complianceFlags: ["engagement", "joy-keys", "re-engagement"],
  },

  // ── MARKETING (DROP-ONLY) ──
  "drop-live": {
    lane: "marketing",
    body: "🚨 NEW DROP — I am Blessed AF\n\n{{productName}} just went live. Limited inventory.\n\n{{dropLink}}\n\nReply STOP to unsubscribe.\n— I am Blessed AF",
    requiresStopLanguage: true,
    complianceFlags: ["drop-only", "limited-inventory", "brand-name"],
  },
  "drop-early-access": {
    lane: "marketing",
    body: "✨ Early Access — I am Blessed AF\n\nYou're getting first look at {{productName}} before anyone else.\n\nAvailable now: {{dropLink}}\n\nReply STOP to unsubscribe.\n— I am Blessed AF",
    requiresStopLanguage: true,
    complianceFlags: ["drop-only", "early-access", "brand-name"],
  },
  "drop-sold-out-warning": {
    lane: "marketing",
    body: "⚡ Almost Gone — I am Blessed AF\n\n{{productName}} is almost sold out. {{remainingCount}} left.\n\n{{dropLink}}\n\nReply STOP to unsubscribe.\n— I am Blessed AF",
    requiresStopLanguage: true,
    complianceFlags: ["drop-only", "scarcity", "brand-name"],
  },

  // ── Custom (for ad-hoc sends via send-sms) ──
  "custom-transactional": {
    lane: "transactional",
    body: "{{body}}",
    requiresStopLanguage: false,
    complianceFlags: ["custom"],
  },
  "custom-marketing": {
    lane: "marketing",
    body: "{{body}}\n\nReply STOP to unsubscribe.\n— I am Blessed AF",
    requiresStopLanguage: true,
    complianceFlags: ["custom", "brand-name"],
  },
};

// ─── HELPERS ───

function resolveMessagingServiceSid(lane: TrafficType): string {
  const envMap: Record<TrafficType, string> = {
    otp: "TWILIO_MESSAGING_SERVICE_SID_OTP",
    transactional: "TWILIO_MESSAGING_SERVICE_SID_TRANSACTIONAL",
    marketing: "TWILIO_MESSAGING_SERVICE_SID_MARKETING",
  };
  const sid = Deno.env.get(envMap[lane]);
  if (!sid) throw new Error(`Missing env: ${envMap[lane]}`);
  return sid;
}

function interpolate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

function containsMarketingKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return MARKETING_KEYWORDS.some((kw) => lower.includes(kw));
}

function isNorthAmerican(phone: string): boolean {
  return phone.startsWith("+1");
}

function formatPhone(raw: string): string {
  const clean = raw.replace(/[^\d+]/g, "");
  if (clean.startsWith("+")) return clean;
  if (clean.length === 10) return `+1${clean}`;
  if (clean.length === 11 && clean.startsWith("1")) return `+${clean}`;
  return `+${clean}`;
}

// ─── MAIN HANDLER ───

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const {
      to,
      templateKey,
      variables = {},
      trafficType,
      mediaUrl,
    } = await req.json();

    // ── Validate trafficType ──
    if (!trafficType || !VALID_LANES.includes(trafficType)) {
      return new Response(
        JSON.stringify({
          error: `Invalid trafficType. Must be one of: ${VALID_LANES.join(", ")}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Validate phone ──
    if (!to) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedTo = formatPhone(to);
    if (!formattedTo.match(/^\+\d{10,15}$/)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format. Use E.164." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Resolve template ──
    const tplKey = templateKey || `custom-${trafficType}`;
    const template = TEMPLATE_REGISTRY[tplKey];

    if (!template) {
      return new Response(
        JSON.stringify({ error: `Unknown template: ${tplKey}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Lane isolation check ──
    if (template.lane !== trafficType) {
      return new Response(
        JSON.stringify({
          error: `LANE VIOLATION: Template '${tplKey}' belongs to '${template.lane}' lane, but trafficType is '${trafficType}'.`,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Build message body ──
    const messageBody = interpolate(template.body, {
      ...variables,
      body: variables.body || "",
    });

    // ── Marketing keyword guard on transactional ──
    if (trafficType === "transactional" && containsMarketingKeywords(messageBody)) {
      return new Response(
        JSON.stringify({
          error: "COMPLIANCE BLOCK: Transactional message contains marketing keywords. Re-classify as 'marketing' or remove promotional content.",
          detectedKeywords: MARKETING_KEYWORDS.filter((kw) =>
            messageBody.toLowerCase().includes(kw)
          ),
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Resolve Messaging Service SID ──
    const messagingServiceSid = resolveMessagingServiceSid(trafficType as TrafficType);

    // ── Send via Twilio ──
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = btoa(`${accountSid}:${authToken}`);

    const formData = new URLSearchParams({
      To: formattedTo,
      MessagingServiceSid: messagingServiceSid,
      Body: messageBody,
    });

    // Status callback
    const statusCallbackUrl = `${supabaseUrl}/functions/v1/sms-status-webhook`;
    formData.append("StatusCallback", statusCallbackUrl);

    // MMS media
    if (mediaUrl && trafficType !== "otp") {
      formData.append("MediaUrl", mediaUrl);
    }

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const twilioData = await twilioRes.json();

    // ── Audit log ──
    await supabase.from("sms_audit_log").insert({
      recipient_phone: formattedTo,
      traffic_type: trafficType,
      template_key: tplKey,
      messaging_service_sid: messagingServiceSid,
      twilio_sid: twilioData.sid || null,
      status: twilioRes.ok ? (twilioData.status || "queued") : "failed",
      error_message: twilioRes.ok ? null : (twilioData.message || "Twilio error"),
      metadata: {
        variables: Object.keys(variables),
        hasMedia: !!mediaUrl,
        isInternational: !isNorthAmerican(formattedTo),
      },
    });

    // ── Also log to sms_deliveries for backward compat ──
    await supabase.from("sms_deliveries").insert({
      recipient_phone: formattedTo,
      message: messageBody.slice(0, 1000),
      twilio_sid: twilioData.sid || null,
      status: twilioRes.ok ? "sent" : "failed",
      error_message: twilioRes.ok ? null : twilioData.message,
      source_page: `${trafficType}/${tplKey}`,
    });

    if (!twilioRes.ok) {
      console.error(`[sms-router] ${trafficType}/${tplKey} FAILED:`, twilioData);
      return new Response(
        JSON.stringify({
          error: twilioData.message || "Twilio send failed",
          code: twilioData.code,
          lane: trafficType,
          template: tplKey,
        }),
        { status: twilioRes.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[sms-router] ✅ ${trafficType}/${tplKey} → ${formattedTo} (${twilioData.sid})`);

    return new Response(
      JSON.stringify({
        success: true,
        sid: twilioData.sid,
        status: twilioData.status,
        lane: trafficType,
        template: tplKey,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[sms-router] error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
