import { useState } from "react";
import { motion } from "framer-motion";
import ImageZoomModal from "@/components/offer/ImageZoomModal";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
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
  Home,
  Package,
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

/* ─── Data ─── */
const STATS = [
  { value: "48", label: "Wristbands Per Box", icon: Package },
  { value: "$1,500", label: "Total Box Value", icon: Gift },
  { value: "3 FREE", label: "For First 100 Realtors", icon: Star },
  { value: "11", label: "Meals per Wristband", icon: Heart },
];

const PROBLEMS = [
  "Your contact list is sitting dead — hundreds of past clients you never re-engage",
  "Sending 'market update' emails gets 3% open rates and zero replies",
  "You spend thousands on Zillow & Realtor.com leads that ghost you",
  "Pop-bys feel awkward and most gifts end up in the trash within a week",
];

const HOW_STEPS = [
  {
    icon: Package,
    title: "Claim Your Reserved Box of 48 Wristbands",
    desc: "We've reserved a box of 4 dozen Neuro-Hacker Gratitude Wristbands valued at $33 each ($1,500 total). First 100 realtors: your list claims the first 3 FREE.",
  },
  {
    icon: Gift,
    title: "Gift Wristbands to Past Clients & SOI",
    desc: "Send a text: 'Hey [Name], I found this neuroscience-backed gratitude wristband and thought of you — can I send you one FREE?' Instant re-engagement. You become the hero with a kind heart.",
  },
  {
    icon: Share2,
    title: "Repost Viral Neuroscience & Gratitude Clips",
    desc: "Share proven viral clips about brain science and gratitude. Your CTA? 'DM me BLESSED for a FREE wristband.' You look like a caring, generous expert — not a salesy agent.",
  },
  {
    icon: Rocket,
    title: "Reactivate Your List & Spike Referrals",
    desc: "When someone wears YOUR wristband daily, they think of YOU. Pop-bys that actually stick. Referrals that come naturally. 'Who's your realtor?' — 'The one who gave me this.'",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Luxury Realtor",
    niche: "Residential Real Estate",
    img: coachSarahImg,
    quote: "I texted 50 past clients offering a free gratitude wristband. 38 responded within 24 hours. THREE asked about listing their homes. My dead database came alive overnight — and I looked like a hero, not a salesperson.",
    results: [
      { label: "List reactivation", before: "3%", after: "76%" },
      { label: "Referrals/mo", before: "2", after: "11" },
      { label: "Listings", before: "1/mo", after: "4/mo" },
    ],
  },
  {
    name: "Marcus Chen",
    role: "Team Leader",
    niche: "Commercial & Residential",
    img: coachMarcusImg,
    quote: "My team of 8 agents each got a box. We gifted wristbands at open houses instead of business cards. People actually WEAR them. Every wristband is a walking billboard that feeds 11 people. Clients love telling that story.",
    results: [
      { label: "Open house leads", before: "5/event", after: "22/event" },
      { label: "Close rate", before: "12%", after: "31%" },
      { label: "GCI", before: "$180K", after: "$420K" },
    ],
  },
  {
    name: "Diana Rosales",
    role: "Neighborhood Specialist",
    niche: "First-Time Buyers",
    img: coachDianaImg,
    quote: "I post gratitude science clips on Instagram and offer free wristbands in comments. My DMs went from 2/day to 25/day. People say 'I love that you're about more than just selling houses.' That's the whole point — and it WORKS.",
    results: [
      { label: "DMs/day", before: "2", after: "25" },
      { label: "Buyer leads", before: "8/mo", after: "35/mo" },
      { label: "Reviews", before: "12", after: "67" },
    ],
  },
];

const PROOF_POINTS = [
  { name: "Dr. Andrew Huberman", img: hubermanImg, quote: "Gratitude practices measurably increase serotonin and dopamine — the same pathways targeted by antidepressants." },
  { name: "Dr. Joe Dispenza", img: dispenzaImg, quote: "When you feel gratitude, your brain begins to rewire itself for abundance rather than lack." },
  { name: "Tony Robbins", img: robbinsImg, quote: "The secret to living is giving. Trade your expectation for appreciation and your whole world changes." },
];

const VALUE_STACK = [
  { item: "Reserved box of 48 wristbands ($33 each)", value: "$1,584" },
  { item: "3 FREE wristbands for your list (first 100 realtors)", value: "$99" },
  { item: "Library of viral neuroscience clips to repost", value: "$2,000" },
  { item: "Text/DM scripts for list reactivation", value: "$500" },
  { item: "Open house gifting strategy playbook", value: "$500" },
  { item: "11 meals donated per wristband (social proof)", value: "Priceless" },
];

const FAQS = [
  { q: "What's in the reserved box?", a: "4 dozen (48) premium Neuro-Hacker Gratitude Wristbands, each valued at $33. Waterproof nylon, debossed, one-size-fits-all. Perfect for gifting at open houses, pop-bys, or mailing to past clients." },
  { q: "How do I get 3 FREE wristbands?", a: "The first 100 realtors who enroll get 3 wristbands shipped FREE to experience them personally and gift to their top clients. Just enroll below — we'll send them to you." },
  { q: "Do I pay for the rest of the box?", a: "Your clients claim wristbands through your custom link and only pay shipping ($9.95). Each claim feeds 11 people. You pay $0 — and you get the lead data (email + phone) automatically." },
  { q: "How does this reactivate my contact list?", a: "Text your past clients: 'I found this neuroscience-backed wristband and thought of you — want one FREE?' This triggers reciprocity AND shows you care. 76% average response rate vs. 3% for market update emails." },
  { q: "Can my whole team use this?", a: "Yes! Each agent on your team can get their own reserved box and custom gifting link. Great for team trainings, open houses, and client appreciation events." },
];

const CLIP_IDEAS = [
  "🧠 \"This brain hack makes you 27x happier in 3 minutes\" + free wristband CTA",
  "🏡 \"The #1 thing top realtors do that has nothing to do with houses\"",
  "🔬 \"Stanford study: gratitude rewires your brain faster than meditation\"",
  "💝 \"Why the best realtors are known for their hearts, not their sales\"",
  "✨ \"The $0 gift that gets more referrals than any closing gift\"",
];

export default function RealtorsListActivation() {
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
        niche: niche || "Real Estate",
        source_page: "realtors-list-activation",
      });
      if (error) throw error;

      supabase.functions.invoke("send-expert-welcome", {
        body: { email, name, niche: niche || "Real Estate" },
      }).catch(console.error);

      setEnrolled(true);
      toast.success("🎉 You're in! Your 3 FREE wristbands are on the way.");
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
              <Home className="w-3 h-3 mr-1" /> ATTENTION: REALTORS & REAL ESTATE TEAMS
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-[1.1] mb-4 tracking-tight">
              Reactivate Your Dead Contact List{" "}
              <span className="text-primary">& Become the Hero</span>
              <br className="hidden md:block" />
              With a Kind Heart 💝
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed">
              We've <strong className="text-foreground">reserved a box of 48 wristbands</strong> valued at{" "}
              <strong className="text-foreground">$1,500</strong> for you. Gift them to past clients, post viral gratitude clips,
              and watch your <strong className="text-foreground">referrals explode</strong> — while feeding 11 people per wristband.
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

          {/* Reserved Box Callout */}
          <motion.div
            className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-5 mb-8 max-w-lg mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Package className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-bold text-foreground mb-1">🎁 YOUR RESERVED BOX</p>
            <p className="text-xs text-muted-foreground mb-2">
              4 dozen wristbands × $33 each = <strong className="text-foreground">$1,500 value</strong>
            </p>
            <Badge className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1">
              First 100 Realtors → 3 FREE Wristbands Shipped to You
            </Badge>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Button
              size="lg"
              onClick={scrollToEnroll}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl gap-2 btn-glow"
            >
              YES! Reserve My Box + 3 FREE Wristbands <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              100% free to enroll. Limited to first 100 realtors.
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
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Your Gift That Keeps Giving</p>
            <h3 className="text-lg font-bold text-foreground">Gift a Wristband → Get a Referral → Feed 11 People</h3>
            <p className="text-xs text-muted-foreground mt-1">Waterproof nylon • Debossed • One-size-fits-all • Ships worldwide</p>
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
                Repost These <span className="text-primary">Viral Clips</span> & Look Like a Hero
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Share neuroscience & gratitude content. Your audience sees you as a caring, generous human — not a salesy agent.
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
                "DM me 'BLESSED' and I'll send you a FREE gratitude wristband — it's backed by neuroscience and feeds 11 people. No strings attached. 🙏"
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-bold">
              <Star className="w-3 h-3 mr-1" /> REAL RESULTS
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Realtors Who <span className="text-primary">Activated</span> Their Lists
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              From dead databases to flooded DMs — powered by a $0 wristband gift.
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

      {/* ═══ PROBLEM ═══ */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
              Your Contact List is <span className="text-primary">Dying</span>
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-8 max-w-md mx-auto">
              Hundreds of past clients sitting in your CRM collecting dust. Here's why your current re-engagement strategy isn't working.
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
            The <span className="text-primary">Gift-First</span> Realtor Strategy
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-10">
            4 steps to reactivate your list, spike referrals & look like a hero
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
                Why <span className="text-primary">Gratitude Gifts</span> Beat Closing Gifts
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Neuroscience proves gratitude releases serotonin & dopamine. A daily wristband reminder keeps YOU top-of-mind.
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
            Total value: $4,683+ — yours at zero cost when you enroll as one of the first 100 realtors.
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
              Your past client gets a beautiful gift. 11 people get fed. And you get a referral-ready relationship.
              That's a triple win your SOI will rave about.
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-black text-foreground">48</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase">Wristbands/box</p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary" />
              <div className="text-center">
                <p className="text-3xl font-black text-primary">528</p>
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
              <Rocket className="w-3 h-3 mr-1" /> FIRST 100 REALTORS ONLY
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Reserve Your <span className="text-primary">$1,500 Box</span> + 3 FREE Wristbands
            </h2>
            <p className="text-sm text-muted-foreground">
              Reactivate your list, spike referrals, and become known for your kind heart — all for $0.
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
                Your 3 FREE wristbands are being prepared. Check your email for your clip library & list reactivation scripts.
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
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Brokerage / Market (optional)</label>
                <Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. Keller Williams, Luxury, First-Time Buyers" className="h-11" />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base h-auto min-h-[48px] py-3 rounded-xl gap-2 btn-glow"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Reserving...
                  </span>
                ) : (
                  <>YES! Reserve My Box + 3 FREE Wristbands <ArrowRight className="w-5 h-5" /></>
                )}
              </Button>
              <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> No credit card</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 3 FREE wristbands</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> First 100 only</span>
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
            Stop Sending Market Updates. Start <span className="text-primary">Gifting.</span>
          </h2>
          <p className="text-sm text-background/70 max-w-md mx-auto mb-6">
            While other agents send boring emails that get deleted, you'll be the one giving a real,
            science-backed gift that reactivates relationships and generates referrals on autopilot.
          </p>
          <Button size="lg" onClick={scrollToEnroll} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl gap-2">
            Reserve My Box + 3 FREE Wristbands <ArrowRight className="w-5 h-5" />
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
