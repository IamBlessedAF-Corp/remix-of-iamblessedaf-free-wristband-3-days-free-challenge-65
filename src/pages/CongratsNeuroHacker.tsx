import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Copy, Check, ExternalLink, Gift, Users, Zap,
  Instagram, ChevronDown, ChevronUp, ArrowRight, Share2, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";
import logoImg from "@/assets/logo.png";
import AuthorAvatar from "@/components/offer/AuthorAvatar";
import GlobalMealCounter from "@/components/GlobalMealCounter";


/* ─── Platform caption templates ─── */
const buildCaptions = (friendName: string, referralLink: string) => [
  {
    platform: "Instagram",
    icon: Instagram,
    color: "from-pink-500 to-purple-600",
    caption: `🧠 Day 1 of my Neuro-Hacker journey.\n\n@${friendName || "mybff"} — I genuinely appreciate you being in my life. Science says receiving gratitude activates your mPFC and makes you up to 27x happier. So here's mine. ❤️\n\nI just joined a movement to feed 11 people through the @IamBlessedAF Gratitude Challenge.\n\n🎁 FREE Neuro-Hacker Wristband for you 👇\n${referralLink}\n\n#NeuroHacker #GratitudeChallenge #27xHappier #IamBlessedAF #Day1`,
  },
  {
    platform: "TikTok",
    icon: Share2,
    color: "from-gray-900 to-gray-700",
    caption: `🧠 POV: You just discovered the Neuro-Hack that makes you 27x happier\n\nTagging @${friendName || "mybff"} because RECEIVING genuine gratitude fires up your mPFC (the happiness center of your brain).\n\nThank you for being you. Seriously. ❤️\n\n🎁 Free Neuro-Hacker Wristband:\n${referralLink}\n\n#NeuroHacker #GratitudeChallenge #27xHappier #IamBlessedAF #Day1`,
  },
  {
    platform: "X / Twitter",
    icon: Share2,
    color: "from-blue-500 to-cyan-500",
    caption: `🧠 Just became a Neuro-Hacker.\n\nScience says receiving genuine gratitude = up to 27x happier (Dr. Hawkins' research).\n\nSo @${friendName || "mybff"} — thank you for being in my life. Genuinely. ❤️\n\n🎁 Free wristband for you: ${referralLink}\n\n#NeuroHacker #IamBlessedAF #Day1`,
  },
  {
    platform: "WhatsApp",
    icon: Heart,
    color: "from-green-500 to-green-600",
    caption: `Hey ${friendName || "friend"}! 🧠\n\nI just joined the Neuro-Hacker Gratitude Challenge and I wanted to start with YOU.\n\nDid you know that receiving genuine gratitude fires up your mPFC and makes you up to 27x happier? (Andrew Huberman's research)\n\nSo here it is: Thank you for being in my life. Genuinely. ❤️\n\nI got you a FREE Neuro-Hacker Wristband as a daily happiness trigger:\n${referralLink}\n\n#IamBlessedAF`,
  },
];

export default function CongratsNeuroHacker() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>("");
  const [friendName, setFriendName] = useState("mybff");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [unlocked, setUnlocked] = useState(false);
  const [showChain, setShowChain] = useState(false);

  const referralLink = referralCode
    ? `https://iamblessedaf.com/r/${referralCode}`
    : "https://iamblessedaf.com/challenge";

  // Load referral code + friend name
  useEffect(() => {
    const stored = localStorage.getItem("gratitude_challenge_setup");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.friendName) setFriendName(parsed.friendName);
      } catch {}
    }
    if (user) {
      supabase
        .from("creator_profiles")
        .select("referral_code")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.referral_code && !data.referral_code.startsWith("pending-")) {
            setReferralCode(data.referral_code);
          }
        });
    }
  }, [user]);

  // Confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.3 } });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Caption copied! Paste it in your post 🚀");
    setTimeout(() => setCopiedIdx(null), 3000);

    // Auto-unlock after first copy
    if (!unlocked) {
      setUnlocked(true);
      setTimeout(() => {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
        toast.success("🎁 $363 Bonus UNLOCKED! 11 Gift Links activated!", { duration: 5000 });
      }, 500);
    }
  };

  const captions = buildCaptions(friendName, referralLink);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
          <img src={logoImg} alt="Logo" className="h-7" />
          <span className="text-sm font-bold">Neuro-Hacker Activated</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* ═══ HERO: Brunson Voice ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-5"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">You Did It</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black leading-tight">
            🧠 Congratulations,<br />
            <span className="text-primary">Neuro-Hacker.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            You just did something <strong className="text-foreground">99% of people will never do</strong> — you committed to
            rewiring your brain for happiness using <em>real neuroscience</em>.
          </p>

          {/* Tony Robbins Quote */}
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 text-left relative"
          >
            <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">
              TONY ROBBINS
            </div>
            <p className="text-sm sm:text-base italic text-muted-foreground leading-relaxed mt-1">
              "The secret to living is <strong className="text-foreground">giving</strong>. Life is not about me —
              it's about <strong className="text-foreground">we</strong>. The moment you start focusing on what you can
              <em> give</em> rather than what you can <em>get</em>, your whole world changes."
            </p>
            <footer className="mt-3">
              <AuthorAvatar author="tony-robbins" />
            </footer>
          </motion.blockquote>

          {/* Global Meal Counter */}
          <GlobalMealCounter variant="banner" />
          
          {/* Social Impact Statement */}
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Only in America, <strong className="text-foreground">14 million children</strong> are facing hunger. 
              Claiming this FREE Neuro-Hacker Wristband feeds <strong className="text-primary">11 of them</strong> — 
              in honor of Andrew Huberman's discoveries in the Neuroscience of Gratitude — 
              through Tony Robbins' <strong className="text-foreground">"1 Billion Meals Challenge"</strong>. 🙏
            </p>
          </div>
        </motion.section>

        {/* ═══ THE SECRET (Brunson Epiphany Bridge) ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="bg-card border border-border/40 rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Here's What The Top 1% Know...
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The real Neuro-Hack isn't just wearing the wristband. It's what happens when your
              <strong className="text-foreground"> entire circle</strong> starts triggering genuine gratitude
              in each other's lives.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dr. Huberman's research showed that <strong className="text-foreground">receiving</strong> genuine
              gratitude activates your <span className="text-destructive font-bold underline">mPFC</span> — the
              happiness center of your brain — making you feel up to <strong className="text-foreground">27× happier</strong>.
            </p>
            <p className="text-sm font-semibold text-foreground">
              But here's the secret most people miss: <em>when your friends ALSO become Neuro-Hackers,
              YOU become the person they thank.</em> That's when the <span className="text-destructive font-bold">mPFC</span> chain
              reaction starts. That's when everything changes.
            </p>
          </div>
        </motion.section>

        {/* ═══ THE UNLOCK ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="text-center space-y-2">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-3 py-1">
                🔓 MEGA UNLOCK
              </Badge>
              <h2 className="text-xl sm:text-2xl font-black">
                Get <span className="text-primary">11 FREE Neuro-Hacker Wristbands</span>
              </h2>
              <p className="text-2xl font-black text-primary">
                $363 Value — Yours FREE
              </p>
            </div>

            <div className="bg-card/80 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Here's how to unlock them right now:
              </p>
              <div className="space-y-2">
                {[
                  { step: "1", text: "Pick your favorite platform below" },
                  { step: "2", text: "Copy the ready-made caption (your link is already in it)" },
                  { step: "3", text: `Tag ${friendName} with a genuine "thank you"` },
                  { step: "4", text: "Post it publicly → 11 Gift Links activate instantly" },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <p className="text-sm text-muted-foreground">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ PLATFORM CAPTIONS ═══ */}
            <div className="space-y-3">
              {captions.map((c, idx) => (
                <div key={c.platform} className="bg-card border border-border/40 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                        <c.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-bold">{c.platform}</span>
                    </div>
                    {expandedIdx === idx ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedIdx === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          <pre className="whitespace-pre-wrap text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 font-sans leading-relaxed border border-border/30">
                            {c.caption}
                          </pre>
                          <Button
                            onClick={() => handleCopy(c.caption, idx)}
                            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2"
                          >
                            {copiedIdx === idx ? (
                              <><Check className="w-4 h-4" /> Copied!</>
                            ) : (
                              <><Copy className="w-4 h-4" /> Copy {c.platform} Caption</>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ═══ UNLOCKED STATE ═══ */}
        <AnimatePresence>
          {unlocked && (
            <motion.section
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/40 rounded-2xl p-5 sm:p-6 text-center space-y-4">
                <div className="text-4xl">🎁</div>
                <h3 className="text-xl font-black text-primary">$363 Bonus UNLOCKED!</h3>
                <p className="text-sm text-muted-foreground">
                  Share your referral link with 11 friends. Each one gets a <strong className="text-foreground">FREE Neuro-Hacker Wristband</strong> and
                  joins the Gratitude Challenge.
                </p>

                {/* Gift Link */}
                <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Your Gift Link</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted/40 rounded-lg px-3 py-2.5 text-xs font-mono text-primary truncate border border-border/30">
                      {referralLink}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(referralLink);
                        toast.success("Gift link copied!");
                      }}
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Each friend who claims through this link gets a FREE wristband + feeds 11 people 🌍
                  </p>
                </div>

                {/* Chain Reaction */}
                <button
                  onClick={() => setShowChain(!showChain)}
                  className="text-xs text-primary font-semibold flex items-center gap-1 mx-auto hover:underline"
                >
                  <Users className="w-3.5 h-3.5" />
                  See the Chain Reaction
                  {showChain ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <AnimatePresence>
                  {showChain && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-card rounded-xl p-4 space-y-3 border border-border/30">
                        {[
                          { emoji: "🧠", label: "You", count: "1 Neuro-Hacker" },
                          { emoji: "👥", label: "Your 11 friends", count: "12 Neuro-Hackers" },
                          { emoji: "🌊", label: "Their friends", count: "133 lives changed" },
                          { emoji: "🌍", label: "Chain reaction", count: "1,464+ people happier" },
                        ].map((tier, i) => (
                          <motion.div
                            key={tier.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="flex items-center gap-3"
                          >
                            <span className="text-xl">{tier.emoji}</span>
                            <div className="flex-1 text-left">
                              <p className="text-xs font-bold text-foreground">{tier.label}</p>
                              <p className="text-[10px] text-muted-foreground">{tier.count}</p>
                            </div>
                            {i < 3 && <ArrowRight className="w-3.5 h-3.5 text-primary" />}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA to Portal */}
              <Button
                asChild
                className="w-full h-14 text-base font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl gap-2"
              >
                <a href="/portal">
                  <Gift className="w-5 h-5" />
                  Enter Your Portal
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ═══ PRE-UNLOCK CTA ═══ */}
        {!unlocked && (
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              👆 Copy any caption above to unlock your <strong>$363 bonus</strong>
            </p>
            <a
              href="/portal"
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground underline"
            >
              Maybe later → Go to Portal
            </a>
          </div>
        )}

        {/* Brunson closing */}
        <div className="text-center pb-8">
          <p className="text-xs text-muted-foreground italic">
            "The person who gives the most value wins." — Russell Brunson
          </p>
        </div>
      </main>
    </div>
  );
}
