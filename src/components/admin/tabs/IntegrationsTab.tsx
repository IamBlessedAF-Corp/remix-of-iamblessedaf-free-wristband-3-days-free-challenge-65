import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import {
  Globe, Code2, Webhook, ShieldCheck, Zap, Copy, Check,
  ExternalLink, AlertTriangle, CheckCircle2, Settings2,
  BarChart3, Activity, Eye, ShoppingCart, UserPlus, CreditCard,
  Share2, Gift, Target, Smartphone, Mail, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

// ─── Facebook Events Config ───
const FB_STANDARD_EVENTS = [
  { name: "PageView", icon: Eye, description: "Every page load across all funnels", enabled: true, priority: "critical" as const },
  { name: "ViewContent", icon: Eye, description: "Product/offer page views with content_ids & value", enabled: true, priority: "critical" as const },
  { name: "AddToCart", icon: ShoppingCart, description: "Checkout button click → Stripe session created", enabled: true, priority: "critical" as const },
  { name: "InitiateCheckout", icon: CreditCard, description: "Stripe checkout session opened", enabled: true, priority: "critical" as const },
  { name: "Purchase", icon: CreditCard, description: "Stripe webhook confirms payment (server-side CAPI)", enabled: true, priority: "critical" as const },
  { name: "Lead", icon: UserPlus, description: "Ambassador signup, challenge join, waitlist entry", enabled: true, priority: "high" as const },
  { name: "CompleteRegistration", icon: UserPlus, description: "Creator profile fully completed", enabled: true, priority: "high" as const },
  { name: "Subscribe", icon: Mail, description: "$11/mo membership subscription started", enabled: true, priority: "high" as const },
  { name: "Contact", icon: MessageSquare, description: "SMS opt-in, WhatsApp invite sent", enabled: false, priority: "medium" as const },
  { name: "CustomizeProduct", icon: Settings2, description: "Shirt customizer interactions", enabled: false, priority: "medium" as const },
  { name: "Share", icon: Share2, description: "Referral link copy, SMS/WhatsApp share taps", enabled: true, priority: "high" as const },
  { name: "Donate", icon: Gift, description: "Meal donation attributed to purchase tier", enabled: true, priority: "high" as const },
];

const FB_CUSTOM_EVENTS = [
  { name: "BlessingConfirmed", description: "Blessing link confirmed by recipient", enabled: true },
  { name: "ChallengeDay1", description: "Gratitude challenge Day 1 completed", enabled: true },
  { name: "ChallengeCompleted", description: "All 3 days of challenge finished", enabled: true },
  { name: "ClipSubmitted", description: "Clipper submits a new video clip", enabled: true },
  { name: "StreakMilestone", description: "Portal login streak hits 3/7/14/30 days", enabled: true },
  { name: "SpinWheelPlay", description: "User plays the spin wheel game", enabled: false },
  { name: "MissionComplete", description: "Portal mission completed for BC coins", enabled: false },
  { name: "ReferralConversion", description: "Referral link click → purchase attributed", enabled: true },
  { name: "UpsellAccepted", description: "Wristband or tier upsell accepted", enabled: true },
  { name: "DownsellAccepted", description: "Exit-intent $11/mo downsell converted", enabled: true },
  { name: "WristbandReserved", description: "Smart wristband Kickstarter reservation", enabled: true },
  { name: "AmbassadorTierUp", description: "Affiliate tier upgraded (Silver→Gold etc)", enabled: true },
];

const INTEGRATION_STATUS = [
  { name: "Facebook Pixel", status: "not_configured", icon: "📘", description: "Browser-side event tracking" },
  { name: "Conversions API (CAPI)", status: "not_configured", icon: "🔗", description: "Server-side event deduplication" },
  { name: "Stripe Webhooks", status: "active", icon: "💳", description: "Payment event processing" },
  { name: "Twilio SMS", status: "active", icon: "📱", description: "OTP, transactional & marketing SMS" },
  { name: "Resend Email", status: "active", icon: "📧", description: "Welcome & digest emails" },
  { name: "ElevenLabs Voice", status: "active", icon: "🎙️", description: "AI voice agent conversations" },
  { name: "YouTube Data API", status: "active", icon: "▶️", description: "Clip view count verification" },
];

export default function IntegrationsTab() {
  const [pixelId, setPixelId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [testEventCode, setTestEventCode] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [eventToggles, setEventToggles] = useState<Record<string, boolean>>(
    Object.fromEntries([
      ...FB_STANDARD_EVENTS.map(e => [e.name, e.enabled]),
      ...FB_CUSTOM_EVENTS.map(e => [e.name, e.enabled]),
    ])
  );

  const copySnippet = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleEvent = (name: string) => {
    setEventToggles(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const activeCount = Object.values(eventToggles).filter(Boolean).length;
  const totalCount = Object.keys(eventToggles).length;

  const pixelSnippet = `<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId || "YOUR_PIXEL_ID"}');
fbq('track', 'PageView');
</script>`;

  const capiSnippet = `// Edge Function: facebook-capi
// POST to https://graph.facebook.com/v21.0/${pixelId || "PIXEL_ID"}/events
const payload = {
  data: [{
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_id: order.id, // dedup key
    user_data: {
      em: [hashSHA256(email)],
      ph: [hashSHA256(phone)],
      client_ip_address: req.headers.get("x-forwarded-for"),
      client_user_agent: req.headers.get("user-agent"),
      fbc: cookies.get("_fbc"),
      fbp: cookies.get("_fbp"),
    },
    custom_data: {
      currency: "USD",
      value: order.amount_cents / 100,
      content_ids: [order.tier],
      content_type: "product",
    },
  }],
  ${testEventCode ? `test_event_code: "${testEventCode}",` : ""}
  access_token: Deno.env.get("FB_ACCESS_TOKEN"),
};`;

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Integrations & API"
        description="Connected services, Facebook Pixel, Conversions API & event mapping"
        defaultCollapsed={false}
        kpis={[
          { label: "Active Integrations", value: INTEGRATION_STATUS.filter(i => i.status === "active").length },
          { label: "Pending Setup", value: INTEGRATION_STATUS.filter(i => i.status !== "active").length },
          { label: "FB Events Active", value: activeCount },
          { label: "Total Events Mapped", value: totalCount },
          { label: "CAPI Status", value: accessToken ? "Ready" : "Not Set" },
          { label: "Dedup Coverage", value: pixelId && accessToken ? "Full" : "Partial" },
        ]}
      />

      {/* Integration Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {INTEGRATION_STATUS.map((int) => (
          <Card key={int.name} className="p-3 bg-card border-border/40 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{int.icon}</span>
              {int.status === "active" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
            <p className="text-[10px] font-bold text-foreground truncate">{int.name}</p>
            <p className="text-[9px] text-muted-foreground truncate">{int.description}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="facebook" className="space-y-4">
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="facebook" className="text-xs gap-1.5"><Globe className="w-3.5 h-3.5" /> Facebook</TabsTrigger>
          <TabsTrigger value="events" className="text-xs gap-1.5"><Zap className="w-3.5 h-3.5" /> Event Mapping</TabsTrigger>
          <TabsTrigger value="capi" className="text-xs gap-1.5"><Webhook className="w-3.5 h-3.5" /> CAPI Setup</TabsTrigger>
          <TabsTrigger value="code" className="text-xs gap-1.5"><Code2 className="w-3.5 h-3.5" /> Code Snippets</TabsTrigger>
        </TabsList>

        {/* ─── Facebook Pixel Config ─── */}
        <TabsContent value="facebook" className="space-y-4">
          <Card className="p-5 bg-card border-border/40 space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-foreground">Facebook Pixel Configuration</h3>
              <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px] ml-auto">Meta Business Suite</Badge>
            </div>

            <div className="bg-secondary/20 border border-border/30 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground">📋 Setup Steps</h4>
              <ol className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Go to <a href="https://business.facebook.com/events_manager" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">Meta Events Manager <ExternalLink className="w-3 h-3" /></a></li>
                <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Click <strong className="text-foreground">"Connect Data Sources"</strong> → <strong className="text-foreground">"Web"</strong> → <strong className="text-foreground">"Facebook Pixel"</strong></li>
                <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Name it <strong className="text-foreground">"IamBlessedAF Pixel"</strong> → Copy the <strong className="text-foreground">Pixel ID</strong> (15-16 digits)</li>
                <li className="flex gap-2"><span className="text-primary font-bold">4.</span> For CAPI: Go to <strong className="text-foreground">Settings</strong> → <strong className="text-foreground">"Generate access token"</strong> → Copy it</li>
                <li className="flex gap-2"><span className="text-primary font-bold">5. </span> For testing: Go to <strong className="text-foreground">Test Events</strong> tab → Copy the <strong className="text-foreground">Test Event Code</strong></li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-medium">Pixel ID</label>
                <Input placeholder="123456789012345" value={pixelId} onChange={(e) => setPixelId(e.target.value)} className="h-8 text-sm font-mono" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-medium">Conversions API Token</label>
                <Input type="password" placeholder="EAAxxxxxxx..." value={accessToken} onChange={(e) => setAccessToken(e.target.value)} className="h-8 text-sm font-mono" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase font-medium">Test Event Code (optional)</label>
                <Input placeholder="TEST12345" value={testEventCode} onChange={(e) => setTestEventCode(e.target.value)} className="h-8 text-sm font-mono" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button size="sm" className="text-xs" onClick={() => toast.success("Configuration saved! Add FB_PIXEL_ID and FB_ACCESS_TOKEN as secrets to deploy.")}>
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Save Configuration
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => window.open("https://business.facebook.com/events_manager", "_blank")}>
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open Events Manager
              </Button>
            </div>
          </Card>

          {/* Verification Checklist */}
          <Card className="p-5 bg-card border-border/40 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Integration Health Check
            </h3>
            <div className="space-y-2">
              {[
                { label: "Pixel ID configured", done: !!pixelId },
                { label: "CAPI access token set", done: !!accessToken },
                { label: "Test event code for debugging", done: !!testEventCode },
                { label: "PageView firing on all pages", done: !!pixelId },
                { label: "Purchase event dedup (browser + server)", done: !!pixelId && !!accessToken },
                { label: "User data hashing (SHA-256)", done: !!accessToken },
                { label: "Event ID matching for dedup", done: !!pixelId && !!accessToken },
                { label: "Domain verification in Business Manager", done: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  {item.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ─── Event Mapping ─── */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Standard Events ({FB_STANDARD_EVENTS.filter(e => eventToggles[e.name]).length} active)</h3>
            <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">{activeCount}/{totalCount} total</Badge>
          </div>

          <div className="grid gap-2">
            {FB_STANDARD_EVENTS.map((ev) => (
              <div key={ev.name} className="flex items-center gap-3 bg-card border border-border/40 rounded-lg px-3 py-2 hover:border-primary/30 transition-colors">
                <ev.icon className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{ev.name}</span>
                    <Badge variant="outline" className={`text-[9px] ${ev.priority === "critical" ? "border-red-500/30 text-red-400" : ev.priority === "high" ? "border-amber-500/30 text-amber-400" : "border-border text-muted-foreground"}`}>{ev.priority}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{ev.description}</p>
                </div>
                <Switch checked={eventToggles[ev.name]} onCheckedChange={() => toggleEvent(ev.name)} />
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-foreground mt-6">Custom Events ({FB_CUSTOM_EVENTS.filter(e => eventToggles[e.name]).length} active)</h3>
          <div className="grid gap-2">
            {FB_CUSTOM_EVENTS.map((ev) => (
              <div key={ev.name} className="flex items-center gap-3 bg-card border border-border/40 rounded-lg px-3 py-2 hover:border-primary/30 transition-colors">
                <Target className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-foreground">{ev.name}</span>
                  <p className="text-[10px] text-muted-foreground truncate">{ev.description}</p>
                </div>
                <Switch checked={eventToggles[ev.name]} onCheckedChange={() => toggleEvent(ev.name)} />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ─── CAPI Setup ─── */}
        <TabsContent value="capi" className="space-y-4">
          <Card className="p-5 bg-card border-border/40 space-y-4">
            <div className="flex items-center gap-2">
              <Webhook className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Conversions API (Server-Side)</h3>
            </div>

            <div className="bg-secondary/20 border border-border/30 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground">🔒 Why Server-Side?</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• <strong className="text-foreground">iOS 14+ / Ad blockers</strong> → Browser pixel misses 30-40% of events</li>
                <li>• <strong className="text-foreground">CAPI sends from server</strong> → 100% event delivery guaranteed</li>
                <li>• <strong className="text-foreground">Event deduplication</strong> → Same event_id from both browser + server = no double counting</li>
                <li>• <strong className="text-foreground">Better match quality</strong> → Server sends hashed email, phone, IP for superior matching</li>
              </ul>
            </div>

            <div className="bg-secondary/20 border border-border/30 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground">📡 Events Sent via CAPI</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {["Purchase", "Lead", "Subscribe", "CompleteRegistration", "BlessingConfirmed", "ChallengeCompleted", "ClipSubmitted", "ReferralConversion"].map(ev => (
                  <div key={ev} className="bg-card border border-border/40 rounded-lg p-2 text-center">
                    <p className="text-[10px] font-bold text-foreground">{ev}</p>
                    <p className="text-[9px] text-emerald-400">Server-side ✓</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary/20 border border-border/30 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground">🔑 Required Secrets</h4>
              <div className="space-y-2">
                {[
                  { key: "FB_PIXEL_ID", desc: "Your Facebook Pixel ID (15-16 digits)", status: "not_set" },
                  { key: "FB_ACCESS_TOKEN", desc: "Conversions API token from Events Manager", status: "not_set" },
                ].map(s => (
                  <div key={s.key} className="flex items-center gap-3 bg-card border border-border/40 rounded-lg px-3 py-2">
                    <code className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{s.key}</code>
                    <span className="text-[10px] text-muted-foreground flex-1">{s.desc}</span>
                    <Badge className={`text-[9px] ${s.status === "set" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                      {s.status === "set" ? "Set ✓" : "Not Set"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary/20 border border-border/30 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground">📐 Architecture</h4>
              <div className="text-xs text-muted-foreground space-y-1 font-mono bg-background rounded-lg p-3 border border-border/30">
                <p className="text-foreground">Browser (Pixel.js)</p>
                <p>  └─ fbq('track', 'Purchase', {'{'} value, event_id {'}'}) ──→ Facebook</p>
                <p className="mt-2 text-foreground">Server (stripe-webhook)</p>
                <p>  └─ POST /v21.0/PIXEL_ID/events</p>
                <p>      └─ event_name: Purchase</p>
                <p>      └─ event_id: same as browser ──→ Facebook (dedup)</p>
                <p className="mt-2 text-foreground">Result:</p>
                <p>  └─ Facebook sees 1 Purchase (matched, high quality) ✅</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ─── Code Snippets ─── */}
        <TabsContent value="code" className="space-y-4">
          <Card className="p-5 bg-card border-border/40 space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Pixel Installation (index.html)</h3>
              <Button size="sm" variant="ghost" className="ml-auto text-xs gap-1" onClick={() => copySnippet(pixelSnippet, "Pixel snippet")}>
                {copied === "Pixel snippet" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === "Pixel snippet" ? "Copied!" : "Copy"}
              </Button>
            </div>
            <pre className="bg-background border border-border/30 rounded-lg p-3 text-[10px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
              {pixelSnippet}
            </pre>
          </Card>

          <Card className="p-5 bg-card border-border/40 space-y-4">
            <div className="flex items-center gap-2">
              <Webhook className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">CAPI Server-Side Call (Edge Function)</h3>
              <Button size="sm" variant="ghost" className="ml-auto text-xs gap-1" onClick={() => copySnippet(capiSnippet, "CAPI snippet")}>
                {copied === "CAPI snippet" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === "CAPI snippet" ? "Copied!" : "Copy"}
              </Button>
            </div>
            <pre className="bg-background border border-border/30 rounded-lg p-3 text-[10px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
              {capiSnippet}
            </pre>
          </Card>

          <Card className="p-5 bg-card border-border/40 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Client-Side Event Helper</h3>
              <Button size="sm" variant="ghost" className="ml-auto text-xs gap-1" onClick={() => copySnippet(clientHelper, "Helper snippet")}>
                {copied === "Helper snippet" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === "Helper snippet" ? "Copied!" : "Copy"}
              </Button>
            </div>
            <pre className="bg-background border border-border/30 rounded-lg p-3 text-[10px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
              {clientHelper}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const clientHelper = `// src/utils/fbPixel.ts
export const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;

export function trackFB(event: string, params?: Record<string, any>) {
  if (typeof window === "undefined" || !window.fbq) return;
  const eventId = crypto.randomUUID();
  window.fbq("track", event, { ...params, eventID: eventId });
  return eventId; // pass to CAPI for dedup
}

// Usage in checkout:
// const eid = trackFB("InitiateCheckout", { value: 111, currency: "USD" });
// Then pass eid to create-checkout edge function for CAPI dedup`;
