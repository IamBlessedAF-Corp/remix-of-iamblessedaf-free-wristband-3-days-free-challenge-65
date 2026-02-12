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
  { value: "2.7x", label: "More Leads Captured", icon: TrendingUp },
  { value: "47%", label: "Higher Show-Up Rate", icon: Users },
  { value: "$0", label: "Cost to You", icon: Gift },
  { value: "11", label: "Meals Donated per Lead", icon: Heart },
];

const PROBLEMS = [
  "Your free PDF gets downloaded and forgotten in 3 seconds",
  "Lead magnets feel generic — zero emotional hook",
  "Prospects don't feel obligated to show up to your call",
  "You're competing with 10,000 other coaches offering the same thing",
];

const HOW_STEPS = [
  {
    icon: Gift,
    title: "Give a FREE Physical Wristband",
    desc: "Your leads claim a real neuroscience-backed gratitude wristband — shipped free. A tangible gift they wear daily.",
  },
  {
    icon: Brain,
    title: "Backed by Neuroscience PhDs",
    desc: "Dr. Huberman, Dr. Dispenza & Tony Robbins' research proves gratitude rewires the brain in 3 days. Your authority skyrockets.",
  },
  {
    icon: Zap,
    title: "They Join YOUR Challenge",
    desc: "Every lead enters a 3-day gratitude challenge branded to you. They text 3 friends daily — organic viral loop built in.",
  },
  {
    icon: Rocket,
    title: "2.7x More Leads, Zero Extra Spend",
    desc: "Physical gifts create reciprocity. Leads who receive something real are 2.7x more likely to book a call or buy your offer.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Mindset Coach",
    niche: "Women's Empowerment",
    img: coachSarahImg,
    quote: "I replaced my free PDF with the wristband funnel and my show-up rate went from 22% to 61%. The reciprocity effect is REAL — when people receive a physical gift, they feel obligated to show up.",
    results: [
      { label: "Leads/mo", before: "120", after: "340" },
      { label: "Show-up %", before: "22%", after: "61%" },
      { label: "Revenue", before: "$8K", after: "$22K" },
    ],
  },
  {
    name: "Marcus Chen",
    role: "Business Strategist",
    niche: "B2B SaaS Consulting",
    img: coachMarcusImg,
    quote: "My clients thought I was crazy giving away wristbands. Then they saw the numbers. Every lead who received one booked a call within 48 hours. My pipeline has never been this full.",
    results: [
      { label: "Calls booked", before: "8/wk", after: "23/wk" },
      { label: "Close rate", before: "15%", after: "34%" },
      { label: "CAC", before: "$180", after: "$42" },
    ],
  },
  {
    name: "Diana Rosales",
    role: "Wellness Therapist",
    niche: "Holistic Health",
    img: coachDianaImg,
    quote: "The neuroscience credibility alone is worth it. When I tell prospects their wristband is backed by Dr. Huberman's research, the trust is instant. I've 3x'd my practice in 90 days.",
    results: [
      { label: "New patients", before: "6/mo", after: "19/mo" },
      { label: "Referrals", before: "2/mo", after: "11/mo" },
      { label: "LTV", before: "$800", after: "$2,400" },
    ],
  },
];

const PROOF_POINTS = [
  { name: "Dr. Andrew Huberman", img: hubermanImg, quote: "Gratitude practices measurably increase serotonin and dopamine — the same pathways targeted by antidepressants." },
  { name: "Dr. Joe Dispenza", img: dispenzaImg, quote: "When you feel gratitude, your brain begins to rewire itself for abundance rather than lack." },
  { name: "Tony Robbins", img: robbinsImg, quote: "The secret to living is giving. Trade your expectation for appreciation and your whole world changes." },
];

const VALUE_STACK = [
  { item: "Custom-branded wristband funnel page", value: "$2,500" },
  { item: "3-day gratitude challenge automation", value: "$1,500" },
  { item: "Viral SMS/WhatsApp loop system", value: "$3,000" },
  { item: "Neuroscience credibility framework", value: "$1,000" },
  { item: "Done-for-you lead capture integration", value: "$2,000" },
];

const FAQS = [
  { q: "Do I have to pay for the wristbands?", a: "No. The gratitude movement covers manufacturing. Your leads only pay shipping ($9.95), which funds 11 meals through Feeding America. You pay $0." },
  { q: "How does this increase my leads?", a: "Physical gifts trigger the reciprocity principle. When someone receives a real item, they feel obligated to reciprocate — by booking your call, joining your program, or sharing with friends." },
  { q: "What niches does this work for?", a: "Coaches, consultants, therapists, speakers, course creators, health & wellness experts, mindset coaches, business strategists — anyone who captures leads." },
  { q: "How fast can I launch?", a: "Your custom funnel is live within 48 hours. We handle the tech, the wristband fulfillment, and the challenge automation. You just drive traffic." },
  { q: "Is this backed by real science?", a: "Yes. The gratitude framework is based on peer-reviewed research from Stanford, Harvard, and the work of Dr. Andrew Huberman, Dr. Joe Dispenza, and others." },
];

export default function ExpertsLeads() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
        niche: niche || null,
        source_page: "experts-leads",
      });
      if (error) throw error;

      // Send welcome email (fire-and-forget)
      supabase.functions.invoke("send-expert-welcome", {
        body: { email, name, niche: niche || null },
      }).catch(console.error);

      setEnrolled(true);
      toast.success("🎉 You're in! Check your email for next steps.");
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
              <Sparkles className="w-3 h-3 mr-1" /> ATTENTION: COACHES, EXPERTS & CONSULTANTS
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-[1.1] mb-4 tracking-tight">
              Increase Your Lead Capture{" "}
              <span className="text-primary">Up to 2.7x</span>
              <br />
              by Giving Away a FREE Wristband
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed">
              Join a <strong className="text-foreground">pay-it-forward gratitude movement</strong> backed
              by neuroscience PhDs. Your leads get a real physical gift.
              You get <strong className="text-foreground">more booked calls, more sales, zero extra cost.</strong>
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
              YES! Enroll Me — It's FREE <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              100% free for experts. No credit card required.
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
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">What Your Leads Receive</p>
            <h3 className="text-lg font-bold text-foreground">A Real, Waterproof Gratitude Wristband — Shipped FREE</h3>
            <p className="text-xs text-muted-foreground mt-1">Debossed • One-size-fits-all • Premium nylon • Ships worldwide</p>
          </div>
        </motion.div>
      </section>

      {/* ═══ COACH TESTIMONIALS ═══ */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                <Star className="w-3 h-3 mr-1" /> REAL RESULTS
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Coaches Who <span className="text-primary">Switched</span> & Never Looked Back
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                They replaced PDFs with wristbands. Here's what happened.
              </p>
            </div>

            <div className="space-y-5">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  className="bg-background border border-border/40 rounded-2xl overflow-hidden"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                >
                  {/* Quote section */}
                  <div className="p-5 pb-4">
                    <div className="flex items-start gap-3.5 mb-4">
                      <img
                        src={t.img}
                        alt={t.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shrink-0"
                        loading="lazy"
                      />
                      <div>
                        <p className="text-sm font-bold text-foreground">{t.name}</p>
                        <p className="text-xs text-primary font-semibold">{t.role}</p>
                        <p className="text-[10px] text-muted-foreground">{t.niche}</p>
                      </div>
                      <Quote className="w-6 h-6 text-primary/20 ml-auto shrink-0 mt-1" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      "{t.quote}"
                    </p>
                  </div>

                  {/* Results metrics */}
                  <div className="bg-primary/5 border-t border-primary/10 px-5 py-3.5 grid grid-cols-3 gap-3">
                    {t.results.map((r, j) => (
                      <div key={j} className="text-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                          {r.label}
                        </p>
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
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
            Your Lead Magnet is <span className="text-primary">Broken</span>
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8 max-w-md mx-auto">
            If you're using PDFs, checklists, or webinars as lead magnets... you're invisible.
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
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-10">
              4 steps to 2.7x your lead capture — zero cost, zero tech headaches
            </p>
            <div className="space-y-4">
              {HOW_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-4 bg-background border border-border/40 rounded-xl p-5"
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
        </div>
      </section>

      {/* ═══ NEUROSCIENCE PROOF ═══ */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-accent text-accent-foreground border-primary/10 text-xs">
              <Brain className="w-3 h-3 mr-1" /> BACKED BY SCIENCE
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Why a <span className="text-primary">Wristband</span> Outperforms a PDF
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Gratitude practices measurably boost serotonin & dopamine. A physical trigger makes it stick.
            </p>
          </div>

          {hawkinsZoomed && (
            <ImageZoomModal
              image={hawkinsImg}
              alt="Dr. Hawkins consciousness scale"
              onClose={() => setHawkinsZoomed(false)}
            />
          )}
          <div
            className="rounded-xl overflow-hidden border border-border/40 mb-8 cursor-zoom-in"
            onClick={() => setHawkinsZoomed(true)}
          >
            <img src={hawkinsImg} alt="Dr. Hawkins consciousness scale" className="w-full h-auto object-contain" loading="lazy" />
            <div className="bg-card p-4">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Dr. David R. Hawkins Scale</p>
              <p className="text-sm text-foreground font-semibold">
                Gratitude vibrates at <span className="text-primary">540</span> — up to 27x higher than the average human baseline
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {PROOF_POINTS.map((p, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 bg-card rounded-xl border border-border/40 p-4"
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
      </section>

      {/* ═══ VALUE STACK ═══ */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
              What You Get — <span className="text-primary">100% FREE</span>
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Total value: $10,000+ — yours at zero cost when you join the movement.
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
        </div>
      </section>

      {/* ═══ SOCIAL IMPACT ═══ */}
      <section className="max-w-3xl mx-auto px-4 py-12 text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Heart className="w-10 h-10 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Every Lead You Capture = <span className="text-primary">11 Meals Donated</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4 leading-relaxed">
            Through our partnership with Feeding America, every wristband claimed through your funnel
            feeds 11 people. Your business grows while making a real-world impact.
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-foreground">100</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase">Leads/month</p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary" />
            <div className="text-center">
              <p className="text-3xl font-black text-primary">1,100</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase">Meals donated</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ ENROLLMENT FORM ═══ */}
      <section id="enroll-section" className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <motion.div className="max-w-md mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-6">
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                <Rocket className="w-3 h-3 mr-1" /> LIMITED SPOTS
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Enroll Now — <span className="text-primary">It's FREE</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Join the gratitude movement and start capturing 2.7x more leads within 48 hours.
              </p>
            </div>

            {enrolled ? (
              <motion.div
                className="bg-background border border-primary/20 rounded-2xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-1">You're In! 🎉</h3>
                <p className="text-sm text-muted-foreground">
                  Check your email — we'll have your custom funnel live within 48 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-background border border-border/40 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="h-11" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className="h-11" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Niche (optional)</label>
                  <Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. Mindset Coach, Business Consultant" className="h-11" />
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
                    <>YES! Enroll Me FREE <ArrowRight className="w-5 h-5" /></>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> No credit card</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Live in 48h</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Cancel anytime</span>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="max-w-3xl mx-auto px-4 py-14">
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
      </section>

      {/* ═══ ROADMAP PHASES OVERVIEW ═══ */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="text-center mb-6">
            <Badge className="mb-3 bg-accent text-accent-foreground border-primary/10 text-xs">
              <Rocket className="w-3 h-3 mr-1" /> BUILT FOR SCALE
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Where <span className="text-primary">Your Funnel</span> Lives
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              A 9-phase growth engine with gamification, analytics, and viral loops — already built for you.
            </p>
          </div>
          <div className="grid gap-2">
            {[
              { name: "Phase 1 — Foundation & Core Engine", pct: 100, color: "bg-emerald-500" },
              { name: "Phase 2 — Revenue Funnel (Hormozi)", pct: 100, color: "bg-emerald-500" },
              { name: "Phase 3 — Viral Growth Engine", pct: 67, color: "bg-amber-500" },
              { name: "Phase 4 — Gamification & Retention", pct: 63, color: "bg-amber-500" },
              { name: "Phase 5 — Operations & PM", pct: 100, color: "bg-emerald-500" },
              { name: "Phase 6 — Analytics & Optimization", pct: 56, color: "bg-amber-500" },
              { name: "Phase 7 — Communications & Lifecycle", pct: 0, color: "bg-destructive" },
              { name: "Phase 8 — Conversion Optimization", pct: 22, color: "bg-amber-500" },
              { name: "Phase 9 — Impact & Community", pct: 60, color: "bg-amber-500" },
            ].map((phase, i) => (
              <div key={i} className="flex items-center gap-3 bg-card border border-border/40 rounded-lg px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{phase.name}</p>
                </div>
                <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden shrink-0">
                  <div className={`h-full rounded-full ${phase.color}`} style={{ width: `${phase.pct}%` }} />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground w-8 text-right shrink-0">{phase.pct}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="bg-foreground">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-background mb-3">
            Stop Competing. Start <span className="text-primary">Giving.</span>
          </h2>
          <p className="text-sm text-background/70 max-w-md mx-auto mb-6">
            While other coaches fight over the same tired lead magnets, you'll be the one giving
            a real, science-backed gift that triggers reciprocity and transforms lives.
          </p>
          <Button size="lg" onClick={scrollToEnroll} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl gap-2">
            Enroll Now — 100% FREE <ArrowRight className="w-5 h-5" />
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
