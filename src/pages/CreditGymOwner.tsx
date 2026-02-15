// /3300us-Credit-Gym-Owner — Gym Owner funnel
import { useState } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import InfluencerTestimonials from "@/components/lead-pages/InfluencerTestimonials";
import LeadPageCountdown from "@/components/lead-pages/LeadPageCountdown";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Gift, Sparkles, ArrowRight, Dumbbell, TrendingUp, DollarSign, Users,
  Zap, Heart, Star, Check,
} from "lucide-react";

const BENEFITS = [
  { icon: Dumbbell, title: "Member Retention System", desc: "Use gratitude journaling to boost member engagement & retention" },
  { icon: DollarSign, title: "New Revenue Stream", desc: "Sell wristbands & bundles to your members as add-on products" },
  { icon: TrendingUp, title: "$3,300 Marketing Credit", desc: "Same system Inc 5000 companies paid $25,000 for" },
  { icon: Users, title: "Community Builder", desc: "Create a gratitude challenge that bonds your gym community" },
  { icon: Zap, title: "Branded Funnel", desc: "Custom funnel with YOUR gym branding and offers" },
  { icon: Heart, title: "Feed 111 People Per Sale", desc: "Every sale feeds 111 people — your members will love it" },
];

const STEPS = [
  { step: "1", title: "Sign Up Free", desc: "Create your account in 60 seconds" },
  { step: "2", title: "Get Your Kit", desc: "Receive branded assets, challenge templates, and product links" },
  { step: "3", title: "Launch & Earn", desc: "Run gratitude challenges and earn on every sale" },
];

export default function CreditGymOwner() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, loading } = useAuth();

  usePageMeta({
    title: "Gym Owners — Get $3,300 Marketing Credit",
    description: "Join as a gym owner. Boost member retention with gratitude challenges, add a new revenue stream, and get a FREE $3,300 marketing credit.",
    image: "/og-clippers.png",
    url: "https://iamblessedaf.com/3300us-Credit-Gym-Owner",
  });

  const openSignup = () => setShowSignupModal(true);
  const handleSignupSuccess = () => {
    setShowSignupModal(false);
    window.location.href = "/3300us-Credit-Portal";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <motion.div className="bg-primary/10 border-b border-primary/20 px-4 py-3 text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Gift className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">💪 FREE <span className="text-primary">$3,300 Marketing Credit</span> for Gym Owners</span>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]"><Sparkles className="w-2.5 h-2.5 mr-0.5" /> LIMITED</Badge>
        </div>
      </motion.div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <img src={logo} alt="Logo" className="h-10 mx-auto mb-5" />
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-xs font-bold px-3 py-1"><Star className="w-3 h-3 mr-1" /> GYM OWNER PROGRAM</Badge>
            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-[1.1] mb-4 tracking-tight">
              Boost <span className="text-primary">Retention</span> & Add<br />a New Revenue Stream 💪
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed">
              Use <strong className="text-foreground">gratitude challenges</strong> to keep members engaged.
              Sell <strong className="text-primary">wristbands & bundles</strong> as premium add-ons and earn on every sale.
            </p>
            <Button onClick={openSignup} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl gap-2 btn-glow">
              Join as Gym Owner <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-md mx-auto px-4 mb-8"><LeadPageCountdown /></div>

      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">How It Works — <span className="text-primary">3 Simple Steps</span></h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <motion.div key={s.step} className="text-center space-y-3" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground text-2xl font-black flex items-center justify-center mx-auto">{s.step}</div>
                <h3 className="text-lg font-bold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">What You Get as a <span className="text-primary">Gym Owner</span></h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {BENEFITS.map((b, i) => (
            <motion.div key={i} className="flex items-start gap-4 bg-card border border-border/40 rounded-xl p-5" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><b.icon className="w-5 h-5 text-primary" /></div>
              <div><h3 className="text-sm font-bold text-foreground mb-0.5">{b.title}</h3><p className="text-xs text-muted-foreground">{b.desc}</p></div>
            </motion.div>
          ))}
        </div>
      </section>

      <InfluencerTestimonials />

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
      ) : user ? (
        <section className="px-4 py-14 max-w-3xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-lg font-bold text-foreground"><Check className="w-5 h-5 text-primary" /> You're signed in</div>
          <a href="/3300us-Credit-Portal" className="inline-flex items-center justify-center h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors btn-glow gap-2">Open Your Portal <ArrowRight className="w-4 h-4" /></a>
        </section>
      ) : (
        <section className="bg-foreground">
          <div className="max-w-3xl mx-auto px-4 py-14 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-background mb-3">Ready to Level Up Your Gym?</h2>
            <p className="text-sm text-background/70 max-w-md mx-auto mb-6">Join as a gym owner, get branded challenge kits, and start earning today.</p>
            <Button onClick={openSignup} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl gap-2">Join Now — It's Free <ArrowRight className="w-5 h-5" /></Button>
          </div>
        </section>
      )}

      <footer className="border-t border-border/30 bg-card">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <img src={logo} alt="Logo" className="h-6 mx-auto mb-2 opacity-50" />
          <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} I am Blessed AF™ — All rights reserved.</p>
        </div>
      </footer>

      <CreatorSignupModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} onSuccess={handleSignupSuccess} />
    </div>
  );
}
