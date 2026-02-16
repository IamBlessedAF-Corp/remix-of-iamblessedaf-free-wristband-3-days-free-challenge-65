import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAuth } from "@/hooks/useAuth";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, Users, Heart, Share2, ArrowRight, Zap, Trophy,
  Target, Shield, Gift, Repeat, Brain, Sparkles, MessageCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ─── Sticky Bottom Bar ─── */
const StickyRepostBar = ({ onJoin }: { onJoin: () => void }) => {
  const [visible, setVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/60 px-4 py-3 safe-bottom"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div className="max-w-lg mx-auto flex items-center gap-3">
        {user ? (
          <Button
            asChild
            className="flex-1 h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl btn-glow"
          >
            <a href="/affiliate-portal">
              Open Portal → Repost & Earn
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </Button>
        ) : (
          <>
            <div className="flex-shrink-0">
              <p className="text-sm font-bold text-foreground">Free Forever</p>
              <p className="text-xs text-primary font-semibold">Earn Rewards</p>
            </div>
            <Button
              onClick={onJoin}
              className="flex-1 h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl btn-glow animate-pulse-glow"
            >
              Join The Movement
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};

/* ─── Main Page ─── */
const RepostAndEarn = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, loading } = useAuth();

  usePageMeta({
    title: "Repost 1 Clip. Transform Your Circle. Earn Rewards.",
    description: "Share gratitude clips with your referral link. The more friends join the challenge, the deeper the transformation in your life and your circle.",
    image: "/og-clippers.png",
    url: "https://iamblessedaf.com/repost-and-earn",
  });

  const openSignup = () => setShowSignupModal(true);
  const handleSignupSuccess = () => {
    setShowSignupModal(false);
    window.location.href = "/affiliate-portal";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ═══ HERO ═══ */}
      <section className="px-4 pt-10 pb-6 max-w-3xl mx-auto">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src={logo} alt="I am Blessed AF" className="w-full max-w-[200px] h-auto object-contain mx-auto mb-6" />

          <p className="text-primary font-bold text-sm uppercase tracking-wider mb-2">
            You already took the first step. Now multiply it.
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-tight">
            The More Friends You Bring In,<br />
            The More <span className="text-primary">Your Life Actually Changes.</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
            You joined the challenge. You got the shirt. You felt the shift.<br />
            Now here's the truth nobody talks about:{" "}
            <strong className="text-foreground">
              gratitude works 27× better when the people around you are doing it too.
            </strong>
          </p>

          <div className="bg-card border border-primary/30 rounded-xl p-5 max-w-md mx-auto mb-6">
            <Brain className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Harvard's 75-year Grant Study proved it:</strong> the #1 predictor of happiness
              isn't money, success, or health — it's the{" "}
              <span className="text-primary font-bold">quality of your relationships.</span>
              <br /><br />
              When your circle practices gratitude together, you don't just feel better —
              you become <strong>neurologically wired for joy.</strong>
            </p>
          </div>

          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-13 px-8 text-base"
            onClick={openSignup}
          >
            Become a Gratitude Ambassador
          </Button>

          <p className="text-xs text-muted-foreground mt-3">
            100% free · Takes 30 seconds · You earn rewards for every friend who joins
          </p>
        </motion.div>
      </section>

      {/* ═══ THE PROBLEM (Hormozi frame) ═══ */}
      <motion.section
        className="px-4 py-10 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="bg-card border border-border/50 rounded-xl p-5 md:p-7">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
            Here's Why Most People <span className="text-destructive">Quit</span> Their Gratitude Practice
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            They journal alone. They meditate alone. They try to rewire their brain… <strong className="text-foreground">in isolation.</strong>
          </p>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            And then they walk into a room of people complaining about traffic, their boss, and the economy.
            Within 3 minutes, their gratitude state is <strong className="text-foreground">completely overwritten.</strong>
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
            <p className="text-sm text-foreground font-semibold leading-relaxed">
              💡 <strong>The fix isn't doing more gratitude.</strong> It's{" "}
              <span className="text-primary">changing who's around you while you do it.</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              When your best friend, your partner, or your gym buddy are ALL in the same 3-day challenge,
              every conversation becomes a trigger for gratitude. That's the 27× multiplier.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ═══ THE MECHANISM ═══ */}
      <motion.section
        className="px-4 py-10 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold mb-1">How Reposting = Real Transformation</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Not a marketing gimmick. Actual neuroscience.
        </p>

        <div className="space-y-4">
          {[
            {
              icon: Repeat,
              title: "You Repost 1 Clip From The Vault",
              desc: "Pick any gratitude clip (Tony Robbins, Huberman, Joe Dispenza). Add your unique referral link. Post it on your story or feed. Takes 60 seconds.",
            },
            {
              icon: Users,
              title: "Your Friends See It & Join The Challenge",
              desc: "They click your link → join the free 3-Day Gratitude Challenge → start texting 'thank you' to 3 people. Your circle starts shifting.",
            },
            {
              icon: Heart,
              title: "Your Entire Circle Transforms Together",
              desc: "When 3-5 people in your life are all practicing gratitude at the same time, every interaction reinforces the habit. Random conversations become gratitude triggers.",
            },
            {
              icon: Sparkles,
              title: "You Get Rewarded For Every Person You Enroll",
              desc: "Blessed Coins, milestone bonuses, exclusive merch, and credit toward the movement. The more people you bring in, the more you earn AND the more your life changes.",
            },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                className="flex items-start gap-4 bg-card border border-border/50 rounded-xl p-4"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="shrink-0 rounded-full p-2.5 bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground mb-0.5">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ═══ WHAT YOU EARN ═══ */}
      <motion.section
        className="px-4 py-10 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="bg-card border border-primary/30 rounded-xl p-5 md:p-7">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Ambassador Rewards
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">What You Earn By Sharing</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Every friend who joins through your link earns you real rewards.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: Gift, label: "Blessed Coins", desc: "Earn BC for every signup, repost & milestone" },
              { icon: Target, label: "Milestone Bonuses", desc: "Unlock rewards at 5, 10, 25 & 50 referrals" },
              { icon: Shield, label: "Exclusive Merch", desc: "Free wristbands, shirts & ambassador gear" },
              { icon: Zap, label: "$3,300 Credit", desc: "Unlock the full ambassador marketing toolkit" },
            ].map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className="bg-secondary/30 rounded-lg p-3.5">
                  <Icon className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-bold text-sm text-foreground mb-0.5">{r.label}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
            <p className="text-sm text-foreground">
              <strong>The math is simple:</strong> you repost 1 clip →{" "}
              <span className="text-primary font-bold">3 friends join</span> → your circle transforms →{" "}
              <span className="text-primary font-bold">you earn rewards</span> → repeat.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ═══ SOCIAL PROOF / IDENTITY ═══ */}
      <motion.section
        className="px-4 py-10 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold mb-1">You're Not Just Sharing a Video.</h2>
        <p className="text-sm text-muted-foreground mb-6">
          You're enrolling people in a movement that actually changes lives.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: Heart, title: "Feed 11 People", desc: "Every signup donates a meal. Your reposts literally feed families." },
            { icon: Brain, title: "27× Happier", desc: "Received gratitude activates mPFC 27× more than solo journaling." },
            { icon: Users, title: "Circle Effect", desc: "When 3+ friends practice together, habit retention jumps 300%." },
            { icon: MessageCircle, title: "Real Conversations", desc: "Your friends text 'thank you' to 3 people. Ripple effect starts." },
            { icon: Shield, title: "Science-Backed", desc: "Harvard Grant Study + Huberman Lab + Dr. Hawkins PhD research." },
            { icon: Sparkles, title: "Be The Catalyst", desc: "You become the person who changed your entire circle's trajectory." },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                className="bg-card rounded-xl p-4 border border-border/50"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Icon className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-bold text-sm text-foreground mb-0.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ═══ HOW IT WORKS (Simple 3-step) ═══ */}
      <motion.section
        className="px-4 py-10 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="bg-card border border-border/50 rounded-xl p-5">
          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> Your 60-Second Game Plan
          </p>
          <div className="flex flex-col gap-3 text-left">
            {[
              "Go to the Content Vault in your portal → pick a clip that hits you in the feels",
              "Tap 'Repost' → your referral link is auto-attached → share to IG Story, TikTok, WhatsApp, or anywhere",
              "Every friend who clicks + joins = rewards for you + transformation for them 🔥",
            ].map((line, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="text-primary font-bold text-xs mt-0.5 shrink-0">{i + 1}.</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ FAQ ═══ */}
      <motion.section
        className="px-4 py-10 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold mb-1">Questions? Answered.</h2>
        <p className="text-sm text-muted-foreground mb-5">No fine print. No gatekeeping.</p>

        <Accordion type="multiple" className="space-y-2">
          {[
            {
              q: "Do I need followers to do this?",
              a: "Zero. You don't need followers, an audience, or a 'brand'. You just need friends. Share a clip in a group chat, post it on your story, or DM it to 3 people. That's it.",
            },
            {
              q: "What do I actually earn?",
              a: "Blessed Coins (BC) for every signup, repost, and milestone. BC can be redeemed for merch, wristbands, and exclusive ambassador perks in the Rewards Store. Plus you unlock the $3,300 Marketing Credit toolkit at higher tiers.",
            },
            {
              q: "How does this help MY life?",
              a: "When your close friends are doing the gratitude challenge alongside you, every conversation becomes a trigger for gratitude. The Harvard Grant Study proved that relationship quality is the #1 predictor of happiness. You're literally upgrading your circle.",
            },
            {
              q: "What clips do I share?",
              a: "We give you a full Content Vault — clips from Tony Robbins, Andrew Huberman, Joe Dispenza, and more. All pre-formatted for TikTok/Reels/Shorts. Your referral link is auto-attached. Pick, post, done.",
            },
            {
              q: "Is this just another MLM?",
              a: "No. There's nothing to buy. There's no downline. You share a free gratitude challenge. Your friends join for free. You earn rewards. Nobody pays anything. It's a movement, not a scheme.",
            },
          ].map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card border border-border/50 rounded-xl px-5 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.section>

      {/* ═══ FINAL CTA ═══ */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : user ? (
        <section className="px-4 py-14 max-w-3xl mx-auto text-center space-y-4">
          <p className="text-lg font-bold text-foreground">You're in the movement ✅</p>
          <a
            href="/affiliate-portal"
            className="inline-flex items-center justify-center h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors btn-glow"
          >
            Open Your Portal → Start Reposting
          </a>
        </section>
      ) : (
        <motion.section
          className="px-4 py-14 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              Your Circle Is Waiting.<br />
              <span className="text-primary">Be The One Who Changes Everything.</span>
            </h2>

            <div className="flex flex-col gap-2.5 max-w-xs mx-auto text-left">
              {[
                "Pick 1 clip from the vault",
                "Share it with your referral link",
                "Watch your circle transform",
              ].map((line) => (
                <div key={line} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{line}</span>
                </div>
              ))}
            </div>

            <div>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-13 px-10 text-base font-bold"
                onClick={openSignup}
              >
                Become a Gratitude Ambassador
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Free forever. No selling. Just sharing what changed your life.
              </p>
            </div>
          </div>
        </motion.section>
      )}

      <CreatorSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSuccess={handleSignupSuccess}
      />

      <StickyRepostBar onJoin={openSignup} />
    </div>
  );
};

export default RepostAndEarn;
