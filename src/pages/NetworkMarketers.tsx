import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Gift,
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
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoImg from "@/assets/logo.png";
import coachSarahImg from "@/assets/coach-sarah.jpg";
import coachMarcusImg from "@/assets/coach-marcus.jpg";
import coachDianaImg from "@/assets/coach-diana.jpg";
import InfluencerTestimonials from "@/components/lead-pages/InfluencerTestimonials";

/* ─── Data ─── */
const STATS = [
  { value: "$3,300", label: "FREE Marketing Credit", icon: Gift },
  { value: "2.7x", label: "Lead Capture Increase", icon: TrendingUp },
  { value: "7", label: "Inc 5000 Companies", icon: Star },
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
    title: "We Build Your Custom Branded Funnel",
    desc: "A full lead-capture funnel customized with YOUR branding and YOUR products — designed to attract warm prospects instead of cold pitching.",
  },
  {
    icon: Phone,
    title: "Capture Emails & Phone Numbers Automatically",
    desc: "Every interested prospect enters their contact info through your funnel. You get a warm lead list of people who already said YES.",
  },
  {
    icon: Rocket,
    title: "Start Conversations That Lead to Sales",
    desc: "Follow up naturally with warm prospects who already know you. Now you have a real relationship — and a warm prospect for your products.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Health & Wellness Rep",
    niche: "Essential Oils & Supplements",
    img: coachSarahImg,
    quote: "I used to send 50 cold DMs a day with maybe 2 replies. Now I post value content, drive people to my funnel, and get 15-20 warm conversations DAILY. My team duplication went through the roof.",
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
    quote: "This funnel system is the ultimate ice-breaker. I share value content and drive traffic to my branded funnel — the DMs flood in from people who already trust me.",
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
    quote: "My Instagram stories used to feel so salesy. Now I share value-first content, drive to my funnel, and people come to ME asking about my products. The energy completely shifted.",
    results: [
      { label: "Story replies", before: "5/wk", after: "40/wk" },
      { label: "New customers", before: "4/mo", after: "16/mo" },
      { label: "Referrals", before: "1/mo", after: "8/mo" },
    ],
  },
];

const VALUE_STACK = [
  { item: "The same proven system Inc 5000 companies paid $25,000 for", value: "$9,700" },
  { item: "Full branded funnel (customized with YOUR branding)", value: "$2,500" },
  { item: "List & past-client reactivation system", value: "$1,500" },
  { item: "Automated email & phone capture system", value: "$1,500" },
  { item: "DM scripts & conversation starters", value: "$500" },
  { item: "Warm follow-up sequence templates", value: "$1,000" },
];

const FAQS = [
  { q: "How does this help me sell my actual products?", a: "It opens conversations. Instead of cold-pitching, you lead with value. When prospects engage with your funnel, they feel genuine trust toward YOU. Follow up naturally about your products from a place of authority." },
  { q: "What content do I repost?", a: "We provide a library of viral, value-driven content with your custom CTA overlay. Topics your audience already loves — designed to drive traffic to YOUR funnel." },
  { q: "Will this work with my current MLM/network?", a: "Yes. This isn't a competing product — it's a lead generation strategy. Whether you sell wellness, beauty, fitness, or financial services, the funnel captures warm leads for YOUR business." },
  { q: "Can my team duplicate this?", a: "Absolutely. The system is simple: Post content → Drive to funnel → Capture contact info → Follow up. Any team member can do this in 10 minutes/day. We even provide copy-paste DM scripts." },
];

export default function NetworkMarketers() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [niche, setNiche] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      toast.success("🎉 You're in! Check your email for your funnel access & DM scripts.");
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
            className="grid grid-cols-3 gap-3 mb-8"
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

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                <Star className="w-3 h-3 mr-1" /> REAL RESULTS
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Network Marketers Who <span className="text-primary">Switched</span> the Strategy
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                From cold DMs to warm conversations — powered by a smarter funnel.
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
        </div>
      </section>

      {/* ═══ INFLUENCER ENDORSEMENTS ═══ */}
      <InfluencerTestimonials />

      {/* ═══ PROBLEM ═══ */}
      <section className="max-w-3xl mx-auto px-4 py-14">
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
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
              The <span className="text-primary">Value-First</span> Strategy
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-10">
              4 steps to turn strangers into warm prospects — without pitching
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

      {/* ═══ ENROLLMENT FORM ═══ */}
      <section id="enroll-section" className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-16">
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
                className="bg-background border border-primary/20 rounded-2xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-1">You're In! 🎉</h3>
                <p className="text-sm text-muted-foreground">
                  Check your email for your funnel access, DM scripts & content library.
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

      {/* ═══ FINAL CTA ═══ */}
      <section className="bg-foreground">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-background mb-3">
            Stop Pitching. Start <span className="text-primary">Attracting.</span>
          </h2>
          <p className="text-sm text-background/70 max-w-md mx-auto mb-6">
            While other reps send cold DMs that get ignored, you'll have a system that
            attracts warm prospects and builds your empire on autopilot.
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
            © {new Date().getFullYear()} I am Blessed AF™ — All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
