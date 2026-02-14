import { useState } from "react";
import { motion } from "framer-motion";
import ImageZoomModal from "@/components/offer/ImageZoomModal";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  Film,
  Gift,
  Heart,
  Rocket,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  ChevronDown,
  Quote,
  Share2,
  MessageCircle,
  Phone,
  Play,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo.png";
import hawkinsImg from "@/assets/hawkins-scale.jpg";
import hubermanImg from "@/assets/author-huberman.jpg";
import dispenzaImg from "@/assets/author-joe-dispenza.jpg";
import robbinsImg from "@/assets/author-tony-robbins.jpg";
import wristbandImg from "@/assets/product-wristbands-new.avif";
import coachSarahImg from "@/assets/coach-sarah.jpg";
import coachMarcusImg from "@/assets/coach-marcus.jpg";
import coachDianaImg from "@/assets/coach-diana.jpg";
import InfluencerTestimonials from "@/components/lead-pages/InfluencerTestimonials";

/* ─── Data ─── */
const STATS = [
  { value: "$3,300", label: "FREE Marketing Credit", icon: Gift },
  { value: "2.7x", label: "Lead Capture Increase", icon: TrendingUp },
  { value: "7", label: "Inc 5000 Companies", icon: Star },
  { value: "11", label: "Meals per Wristband", icon: Heart },
];

const PROBLEMS = [
  "Cold DMs get ignored — nobody trusts \"Hey girl!\" anymore",
  "You're pitching products before building any real connection",
  "Reposting company promos looks salesy and kills your feed aesthetic",
  "Your audience scrolls past your posts because they look like every other rep",
];

const HOW_STEPS = [
  {
    icon: Gift,
    title: "Gift a FREE Wristband in DMs & Comments",
    desc: "Instead of pitching, lead with a genuine gift. Drop \"I'd love to send you a FREE gratitude wristband\" — instant curiosity, zero sales resistance.",
  },
  {
    icon: Share2,
    title: "Repost Viral Neuroscience & Gratitude Clips",
    desc: "Share proven viral content about gratitude science, Huberman brain hacks & happiness research. Your CTA? \"Want a FREE wristband? Link in bio.\" Content does the selling.",
  },
  {
    icon: Phone,
    title: "Capture Emails & Phone Numbers Automatically",
    desc: "When they claim the wristband, they enter their email & phone. You get a warm lead list of people who already said YES to something from you.",
  },
  {
    icon: Rocket,
    title: "Start Conversations That Lead to Sales",
    desc: "Follow up naturally: \"Did your wristband arrive? How's the gratitude challenge going?\" Now you have a real relationship — and a warm prospect for your products.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Health & Wellness Rep",
    niche: "Essential Oils & Supplements",
    img: coachSarahImg,
    quote: "I used to send 50 cold DMs a day with maybe 2 replies. Now I post a gratitude clip, offer a free wristband, and get 15-20 warm conversations DAILY. My team duplication went through the roof.",
    results: [
      { label: "DM replies", before: "2/day", after: "18/day" },
      { label: "Team signups", before: "2/mo", after: "9/mo" },
      { label: "Income", before: "$800", after: "$4,200" },
    ],
  },
  {
    name: "Marcus Chen",
    role: "Fitness Network Leader",
    niche: "Nutrition & Performance",
    img: coachMarcusImg,
    quote: "The wristband is the ultimate ice-breaker. I repost neuroscience clips about gratitude and dopamine — my audience already cares about brain optimization. Then I just say 'want a free one?' and the DMs flood.",
    results: [
      { label: "Leads/week", before: "8", after: "35" },
      { label: "Conversions", before: "3%", after: "22%" },
      { label: "Team size", before: "12", after: "47" },
    ],
  },
  {
    name: "Diana Rosales",
    role: "Beauty & Skincare Rep",
    niche: "Clean Beauty MLM",
    img: coachDianaImg,
    quote: "My Instagram stories used to feel so salesy. Now I share gratitude content, gift wristbands, and people come to ME asking about my products. The energy completely shifted. Plus, 11 meals donated per lead? My audience LOVES that.",
    results: [
      { label: "Story replies", before: "5/wk", after: "40/wk" },
      { label: "New customers", before: "4/mo", after: "16/mo" },
      { label: "Referrals", before: "1/mo", after: "8/mo" },
    ],
  },
];

const PROOF_POINTS = [
  { name: "Dr. Andrew Huberman", img: hubermanImg, quote: "Gratitude practices measurably increase serotonin and dopamine — the same pathways targeted by antidepressants." },
  { name: "Dr. Joe Dispenza", img: dispenzaImg, quote: "When you feel gratitude, your brain begins to rewire itself for abundance rather than lack." },
  { name: "Tony Robbins", img: robbinsImg, quote: "The secret to living is giving. Trade your expectation for appreciation and your whole world changes." },
];

const VALUE_STACK = [
  { item: "Full branded funnel (customized with YOUR branding)", value: "$2,500" },
  { item: "List & past-client reactivation system", value: "$1,500" },
  { item: "Library of viral neuroscience clips to repost", value: "$2,000" },
  { item: "Automated email & phone capture system", value: "$1,500" },
  { item: "DM scripts & conversation starters", value: "$500" },
  { item: "Warm follow-up sequence templates", value: "$1,000" },
  { item: "Reserved box of 48 wristbands ($33 each)", value: "$1,584" },
  { item: "3 FREE wristbands shipped to you (first 100)", value: "$99" },
  { item: "11 meals donated per lead (social proof)", value: "Priceless" },
];

const FAQS = [
  { q: "Do I have to pay for the wristbands I gift?", a: "No. The gratitude movement covers manufacturing. Your prospects only pay shipping ($9.95), which funds 11 meals through Feeding America. You pay $0 — it's a genuinely free gift." },
  { q: "How does this help me sell my actual products?", a: "It opens conversations. Instead of cold-pitching, you lead with value. When someone wears a wristband you gifted, they feel genuine gratitude toward YOU. Follow up naturally about your products from a place of trust." },
  { q: "What clips do I repost?", a: "We provide a library of viral neuroscience & gratitude clips with your custom CTA overlay (\"FREE wristband — link in bio\"). Topics include dopamine, brain rewiring, happiness hacks — content your audience already loves." },
  { q: "Will this work with my current MLM/network?", a: "Yes. This isn't a competing product — it's a lead generation strategy. Whether you sell wellness, beauty, fitness, or financial services, the wristband is a universal ice-breaker that captures warm leads for YOUR business." },
  { q: "Can my team duplicate this?", a: "Absolutely. The system is simple: Post clip → Offer free wristband → Capture contact info → Follow up. Any team member can do this in 10 minutes/day. We even provide copy-paste DM scripts." },
];

const CLIP_IDEAS = [
  "🧠 \"This brain hack makes you 27x happier in 3 minutes\" + free wristband CTA",
  "🔬 \"Stanford study: gratitude rewires your brain faster than meditation\"",
  "💡 \"Dr. Huberman's #1 hack for dopamine without supplements\"",
  "🎯 \"The 3-minute morning ritual billionaires swear by\"",
  "✨ \"Why giving compliments literally changes your brain chemistry\"",
];

const CLIP_LIBRARY = [
  {
    title: "Brain Hack: 27x Happier in 3 Minutes",
    platform: "TikTok / Reels",
    duration: "0:47",
    views: "2.4M+",
    hook: "\"Your brain has a hidden cheat code for happiness...\"",
    ctaOverlay: "FREE Wristband — Link in Bio 🧠",
    downloadHint: "DM us 'CLIP1' to get this clip + CTA overlay",
  },
  {
    title: "Huberman's #1 Dopamine Hack (No Supplements)",
    platform: "TikTok / Reels / Shorts",
    duration: "0:58",
    views: "1.8M+",
    hook: "\"Dr. Huberman says stop taking dopamine supplements...\"",
    ctaOverlay: "Get a FREE Gratitude Wristband 🎁",
    downloadHint: "DM us 'CLIP2' to get this clip + CTA overlay",
  },
  {
    title: "Why Billionaires Practice Gratitude (Not Hustle)",
    platform: "Reels / YouTube Shorts",
    duration: "1:02",
    views: "950K+",
    hook: "\"Elon, Oprah, and Jeff Bezos all do this ONE thing...\"",
    ctaOverlay: "Claim Your FREE Wristband ⬇️",
    downloadHint: "DM us 'CLIP3' to get this clip + CTA overlay",
  },
  {
    title: "The Compliment That Rewires Your Brain",
    platform: "TikTok / Facebook",
    duration: "0:34",
    views: "3.1M+",
    hook: "\"Give someone a genuine compliment and watch what happens to YOUR brain...\"",
    ctaOverlay: "FREE 'I Am Blessed AF' Wristband 🙏",
    downloadHint: "DM us 'CLIP4' to get this clip + CTA overlay",
  },
  {
    title: "Stanford Study: Gratitude vs Meditation",
    platform: "All Platforms",
    duration: "0:52",
    views: "1.2M+",
    hook: "\"Stanford just proved gratitude beats meditation...\"",
    ctaOverlay: "Link in Bio → FREE Wristband 🔗",
    downloadHint: "DM us 'CLIP5' to get this clip + CTA overlay",
  },
];

const CTA_OVERLAYS = [
  { name: "Free Wristband CTA", file: "cta-free-wristband.png", desc: "Clean bottom-bar overlay: \"FREE 'I Am Blessed AF' Wristband — Link in Bio\"" },
  { name: "Gift a Friend CTA", file: "cta-gift-friend.png", desc: "Social proof overlay: \"DM me 'BLESSED' for a FREE wristband 🙏\"" },
  { name: "Science Hook CTA", file: "cta-science-hook.png", desc: "Authority overlay: \"Backed by Stanford Neuroscience — Get Yours FREE\"" },
  { name: "Gratitude Challenge CTA", file: "cta-gratitude-challenge.png", desc: "Engagement overlay: \"Join the 21-Day Gratitude Challenge — FREE wristband\"" },
];

export default function NetworkMarketers() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [niche, setNiche] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hawkinsZoomed, setHawkinsZoomed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("expert_leads").insert({
        full_name: name,
        email,
        niche: niche || "Network Marketing",
        source_page: "network-marketers",
      });
      if (error) throw error;

      supabase.functions.invoke("send-network-marketer-welcome", {
        body: { email, name, niche: niche || "Network Marketing" },
      }).catch(console.error);

      setEnrolled(true);
      toast.success("🎉 You're in! Check your email for your clip library & DM scripts.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToEnroll = () => {
    document.getElementById("enroll-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <img src={logoImg} alt="I am Blessed AF" className="h-10 mx-auto mb-5" />
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-xs font-bold px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" /> ATTENTION: NETWORK MARKETERS & SOCIAL SELLERS
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-[1.1] mb-4 tracking-tight">
              Get a FREE{" "}
              <span className="text-primary">$3,300 Marketing Credit</span>
              <br className="hidden md:block" />
              To Reactivate Your List 🔥
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed">
              The <strong className="text-foreground">same strategy we used to increase 2.7x lead capture for 7 Inc 5000 companies.</strong>{" "}
              A full funnel — <strong className="text-foreground">customized with YOUR branding</strong> — to reactivate your list, re-engage past clients & start{" "}
              <strong className="text-foreground">real conversations that close sales.</strong>
            </p>
          </motion.div>

          {/* KPI Row */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {STATS.map((s, i) => (
              <div key={i} className="bg-card border border-border/40 rounded-xl p-3 text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-black text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Button
              size="lg"
              onClick={scrollToEnroll}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl gap-2 btn-glow"
            >
              YES! Claim My FREE $3,300 Marketing Credit <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              100% free. Same strategy behind 7 Inc 5000 companies. Works with any network or product.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ WRISTBAND VISUAL ═══ */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <motion.div
          className="relative rounded-2xl overflow-hidden border border-border/40 bg-card"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <img src={wristbandImg} alt="Gratitude wristbands" className="w-full h-56 md:h-72 object-contain bg-card" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Your Secret Weapon</p>
            <h3 className="text-lg font-bold text-foreground">Gift This FREE Wristband → Start a Conversation → Close the Sale</h3>
            <p className="text-xs text-muted-foreground mt-1">Waterproof nylon • Debossed • Ships worldwide • $0 cost to you</p>
          </div>
        </motion.div>
      </section>

      {/* ═══ CLIP CONTENT IDEAS ═══ */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                <Share2 className="w-3 h-3 mr-1" /> VIRAL CLIP LIBRARY
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Repost These <span className="text-primary">Viral Clips</span> + Add Your CTA
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We give you a library of neuroscience & gratitude clips proven to go viral.
                Just add your "FREE wristband" CTA and watch the leads pour in.
              </p>
            </div>

            <div className="space-y-2.5 max-w-lg mx-auto">
              {CLIP_IDEAS.map((clip, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 bg-background border border-border/40 rounded-xl px-4 py-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground font-medium">{clip}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4 max-w-lg mx-auto">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">💬 Your CTA on Every Clip</p>
              <p className="text-sm text-foreground italic">
                "Want a FREE 'I Am Blessed AF' wristband? Drop a 🙏 in the comments or DM me 'BLESSED' — I'll send you one, no strings!"
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CLIP LIBRARY ═══ */}
      <section id="clip-library" className="max-w-3xl mx-auto px-4 py-14">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-bold">
              <Film className="w-3 h-3 mr-1" /> CLIP LIBRARY — READY TO REPOST
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Your <span className="text-primary">Viral Clip Arsenal</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Proven clips with millions of views. Download, add your CTA overlay, and repost. We've done the hard work — you just hit "share."
            </p>
          </div>

          <div className="space-y-3">
            {CLIP_LIBRARY.map((clip, i) => (
              <motion.div
                key={i}
                className="bg-card border border-border/40 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Play className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground mb-1">{clip.title}</h4>
                      <p className="text-xs text-muted-foreground italic mb-2">Hook: {clip.hook}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5 font-semibold">
                          <Eye className="w-3 h-3" /> {clip.views}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] bg-accent text-accent-foreground rounded-full px-2 py-0.5 font-semibold">
                          <Clock className="w-3 h-3" /> {clip.duration}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">{clip.platform}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">CTA Overlay</p>
                      <p className="text-xs text-foreground">{clip.ctaOverlay}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      <Download className="w-3 h-3 mr-1" /> {clip.downloadHint.split("'")[1]}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Overlay Templates */}
          <div className="mt-10">
            <h3 className="text-lg font-bold text-foreground text-center mb-2">
              📐 CTA Overlay Templates
            </h3>
            <p className="text-xs text-muted-foreground text-center mb-5">
              Download these ready-made overlays. Add to your clips in CapCut, InShot, or Canva — takes 30 seconds.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CTA_OVERLAYS.map((overlay, i) => (
                <motion.a
                  key={i}
                  href={`/cta-overlays/${overlay.file}`}
                  download
                  className="bg-card border border-border/40 rounded-xl p-4 text-center hover:border-primary/40 transition-colors group"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-bold text-foreground mb-0.5">{overlay.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug">{overlay.desc}</p>
                </motion.a>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground mb-3">
              Need custom clips for your niche? DM us on Instagram <strong className="text-foreground">@iamblessedaf</strong> and we'll create them for you.
            </p>
            <Button variant="outline" className="gap-2 rounded-xl" onClick={() => window.open("https://instagram.com/iamblessedaf", "_blank")}>
              <ExternalLink className="w-4 h-4" /> Follow @iamblessedaf for Fresh Clips
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-14">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-bold">
              <Star className="w-3 h-3 mr-1" /> REAL RESULTS
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Network Marketers Who <span className="text-primary">Switched</span> the Strategy
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              From cold DMs to warm conversations — powered by a free wristband.
            </p>
          </div>

          <div className="space-y-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                className="bg-card border border-border/40 rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="p-5 pb-4">
                  <div className="flex items-start gap-3.5 mb-4">
                    <img src={t.img} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shrink-0" loading="lazy" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-primary font-semibold">{t.role}</p>
                      <p className="text-[10px] text-muted-foreground">{t.niche}</p>
                    </div>
                    <Quote className="w-6 h-6 text-primary/20 ml-auto shrink-0 mt-1" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
                </div>
                <div className="bg-primary/5 border-t border-primary/10 px-5 py-3.5 grid grid-cols-3 gap-3">
                  {t.results.map((r, j) => (
                    <div key={j} className="text-center">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{r.label}</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-xs text-muted-foreground line-through">{r.before}</span>
                        <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                        <span className="text-sm font-black text-primary">{r.after}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ INFLUENCER ENDORSEMENTS ═══ */}
      <InfluencerTestimonials />

      {/* ═══ PROBLEM ═══ */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
              Your Current Strategy is <span className="text-primary">Burned Out</span>
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-8 max-w-md mx-auto">
              If you're still cold DM'ing, posting product selfies, and hoping people reach out... you're leaving money on the table.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {PROBLEMS.map((p, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 bg-destructive/5 border border-destructive/10 rounded-xl p-4"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-destructive">✗</span>
                  </div>
                  <p className="text-sm text-foreground">{p}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
            The <span className="text-primary">Gift-First</span> Strategy
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-10">
            4 steps to turn strangers into warm prospects — without pitching
          </p>
          <div className="space-y-4">
            {HOW_STEPS.map((step, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-4 bg-card border border-border/40 rounded-xl p-5"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                      STEP {i + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ NEUROSCIENCE PROOF ═══ */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-accent text-accent-foreground border-primary/10 text-xs">
                <Brain className="w-3 h-3 mr-1" /> BACKED BY SCIENCE
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Why <span className="text-primary">Gratitude Content</span> Goes Viral
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Neuroscience proves gratitude releases serotonin & dopamine. People WANT this content — and they'll engage with yours.
              </p>
            </div>

            {hawkinsZoomed && (
              <ImageZoomModal image={hawkinsImg} alt="Dr. Hawkins consciousness scale" onClose={() => setHawkinsZoomed(false)} />
            )}
            <div className="rounded-xl overflow-hidden border border-border/40 mb-8 cursor-zoom-in" onClick={() => setHawkinsZoomed(true)}>
              <img src={hawkinsImg} alt="Dr. Hawkins consciousness scale" className="w-full h-auto object-contain" loading="lazy" />
              <div className="bg-background p-4">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Dr. David R. Hawkins Scale</p>
                <p className="text-sm text-foreground font-semibold">
                  Gratitude vibrates at <span className="text-primary">540</span> — up to 27x higher than the average baseline
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {PROOF_POINTS.map((p, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 bg-background rounded-xl border border-border/40 p-4"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <img src={p.img} alt={p.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shrink-0" loading="lazy" />
                  <div>
                    <p className="text-xs font-bold text-foreground">{p.name}</p>
                    <p className="text-sm text-muted-foreground italic leading-relaxed mt-0.5">"{p.quote}"</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ VALUE STACK ═══ */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
            What You Get — <span className="text-primary">100% FREE</span>
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            $3,300+ marketing credit — yours at zero cost. Same system behind 2.7x lead capture for 7 Inc 5000 companies.
          </p>
          <Card className="border-primary/20 overflow-hidden">
            <CardContent className="p-0">
              {VALUE_STACK.map((v, i) => (
                <div key={i} className={`flex items-center justify-between px-5 py-3.5 ${i < VALUE_STACK.length - 1 ? "border-b border-border/30" : ""}`}>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">{v.item}</span>
                  </div>
                  <span className="text-sm font-bold text-muted-foreground line-through">{v.value}</span>
                </div>
              ))}
              <div className="bg-primary/5 px-5 py-4 flex items-center justify-between">
                <span className="text-base font-bold text-foreground">Your Price Today</span>
                <span className="text-2xl font-black text-primary">$0</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* ═══ SOCIAL IMPACT ═══ */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Heart className="w-10 h-10 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Every Wristband You Gift = <span className="text-primary">11 Meals Donated</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4 leading-relaxed">
              Your prospect gets a free wristband. 11 people get fed. And you get a warm lead.
              That's a triple win your audience will rave about.
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-black text-foreground">50</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Wristbands/month</p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary" />
              <div className="text-center">
                <p className="text-3xl font-black text-primary">550</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Meals donated</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ ENROLLMENT FORM ═══ */}
      <section id="enroll-section" className="max-w-3xl mx-auto px-4 py-16">
        <motion.div className="max-w-md mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="text-center mb-6">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-bold">
              <Rocket className="w-3 h-3 mr-1" /> FIRST 100 MARKETERS ONLY
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Claim Your FREE <span className="text-primary">$3,300 Marketing Credit</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Full branded funnel to reactivate your list & past clients. Same strategy behind 2.7x lead capture for 7 Inc 5000 companies.
            </p>
          </div>

          {enrolled ? (
            <motion.div
              className="bg-card border border-primary/20 rounded-2xl p-8 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">You're In! 🎉</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Check your email for your clip library, DM scripts & wristband gifting link.
              </p>
              <Button
                onClick={() => window.open("/FREE-neuro-hacker-wristband", "_blank")}
                variant="outline"
                className="gap-2"
              >
                <Gift className="w-4 h-4" /> Claim YOUR Free Wristband Too
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border/40 rounded-2xl p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="h-11" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className="h-11" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone (for SMS updates)</label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="h-11" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Network/Product (optional)</label>
                <Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. Health & Wellness, Beauty, Fitness" className="h-11" />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base h-12 rounded-xl gap-2 btn-glow"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Enrolling...
                  </span>
                ) : (
                  <>YES! Claim My FREE $3,300 Marketing Credit <ArrowRight className="w-5 h-5" /></>
                )}
              </Button>
              <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> No credit card</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instant access</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Works with any network</span>
              </div>
            </form>
          )}
        </motion.div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-2 max-w-xl mx-auto">
            {FAQS.map((faq, i) => (
              <motion.div key={i} className="border border-border/40 rounded-xl overflow-hidden" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-accent/30 transition-colors">
                  <span className="text-sm font-semibold text-foreground pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="bg-foreground">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-background mb-3">
            Stop Pitching. Start <span className="text-primary">Gifting.</span>
          </h2>
          <p className="text-sm text-background/70 max-w-md mx-auto mb-6">
            While other reps send cold DMs that get ignored, you'll be the one giving a real,
            science-backed gift that opens doors and builds your empire.
          </p>
          <Button size="lg" onClick={scrollToEnroll} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl gap-2">
            Claim My FREE $3,300 Credit <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-border/30 bg-card">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <img src={logoImg} alt="Logo" className="h-6 mx-auto mb-2 opacity-50" />
          <p className="text-[10px] text-muted-foreground">
            © {new Date().getFullYear()} I am Blessed AF™ — Gratitude Engine. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
