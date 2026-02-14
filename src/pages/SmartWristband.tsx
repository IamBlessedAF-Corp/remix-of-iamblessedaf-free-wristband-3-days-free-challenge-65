import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, Zap, Brain, Sparkles, Rocket, Shield, Activity, Wifi, Loader2 } from "lucide-react";
import MpfcTooltip from "@/components/offer/MpfcTooltip";
import SmartWristbandAuth from "@/components/smart-wristband/SmartWristbandAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useAuth } from "@/hooks/useAuth";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";
import productWristbands from "@/assets/product-wristbands-new.avif";

const DISCOVERIES = [
  { icon: Brain, label: "mPFC Activation Loop" },
  { icon: Zap, label: "Dopamine × Serotonin Spike" },
  { icon: Activity, label: "Vagal Tone Enhancement" },
  { icon: Sparkles, label: "Neuroplasticity Triggers" },
  { icon: Shield, label: "Cortisol Down-Regulation" },
  { icon: Wifi, label: "NFC TAP Neuro-Hack" },
  { icon: Cpu, label: "Zero-Battery Smart Tech" },
  { icon: Rocket, label: "Autopilot Gratitude Habits" },
];

/** Countdown hook — persists launch date so it doesn't shift on refresh */
const useLaunchCountdown = () => {
  const [end] = useState(() => {
    const saved = localStorage.getItem("kickstarter-launch-ts");
    if (saved) return parseInt(saved);
    const ts = Date.now() + 27 * 24 * 60 * 60 * 1000;
    localStorage.setItem("kickstarter-launch-ts", ts.toString());
    return ts;
  });

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, end - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
};

const SmartWristband = () => {
  usePageMeta({
    title: "Reserve Your mPFC Neuro-Hacker Wristband SMART | IamBlessedAF",
    description:
      "The world's first smart wearable neuro-hack. NFC TAP technology to activate your mPFC and trigger Dopamine × Serotonin spikes on autopilot.",
    image: "/og-wristband.png",
    url: "https://iamblessedaf.com/Reserve-your-Neuro-Hack-Wristband-SMART",
  });

  const { user } = useAuth();
  const { startCheckout, loading } = useStripeCheckout();
  const countdown = useLaunchCountdown();

  // A/B test: check URL for ?variant=1 to show $1 option
  const variant = new URLSearchParams(window.location.search).get("variant");
  const isOneVariant = variant === "1";

  const handleReserve = () => {
    startCheckout(isOneVariant ? ("kickstarter-1" as any) : ("kickstarter-11" as any));
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative py-12 px-4 text-center max-w-2xl mx-auto">
        <motion.img
          src={logoImg}
          alt="IamBlessedAF"
          className="h-10 mx-auto mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* ── Countdown Timer ── */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Kickstarter Launches In
          </p>
          <div className="flex justify-center gap-2">
            {[
              { value: countdown.days, label: "Days" },
              { value: countdown.hours, label: "Hrs" },
              { value: countdown.minutes, label: "Min" },
              { value: countdown.seconds, label: "Sec" },
            ].map((unit) => (
              <div
                key={unit.label}
                className="bg-card border border-primary/20 rounded-xl px-3 py-2 min-w-[56px]"
              >
                <p className="text-xl md:text-2xl font-black text-primary tabular-nums">
                  {String(unit.value).padStart(2, "0")}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                  {unit.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p
          className="text-xs font-black uppercase tracking-[0.25em] text-primary mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Coming Soon on Kickstarter 🚀
        </motion.p>

        <motion.h1
          className="text-3xl md:text-4xl font-black leading-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          The World's First{" "}
          <span className="text-primary">Smart Wearable Neuro-Hack</span> 🧠
        </motion.h1>

        <motion.h2
          className="text-xl md:text-2xl font-bold text-foreground/90 mb-6 leading-snug"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          "<MpfcTooltip /> Neuro-Hacker Wristband{" "}
          <span className="text-primary">SMART</span>"
        </motion.h2>

        {/* ── Wristband Product Image ── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", duration: 0.6 }}
        >
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-soft">
            <div className="aspect-[4/3] flex items-center justify-center p-6 bg-secondary/20">
              <img
                src={productWristbands}
                alt="mPFC Neuro-Hacker Wristband SMART"
                className="max-w-full max-h-full object-contain drop-shadow-lg"
                loading="eager"
              />
            </div>
          </div>
        </motion.div>

        {/* ── Reserve CTA ── */}
        <motion.div
          className="mb-8 bg-card border-2 border-primary/30 rounded-2xl p-5 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
            Early Bird Reservation
          </p>
          <p className="text-2xl md:text-3xl font-black text-foreground mb-1">
            Reserve with{" "}
            <span className="text-primary">{isOneVariant ? "$1" : "$11"}</span>{" "}
            — Secure{" "}
            <span className="text-primary">77% OFF</span>
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Regular Price <span className="line-through">$99</span> → Early-Bird{" "}
            <strong className="text-foreground">$33</strong>{" "}
            <span className="text-[11px]">(+ your {isOneVariant ? "$1" : "$11"} deposit applied)</span>
          </p>
          <Button
            onClick={handleReserve}
            disabled={loading}
            className="w-full min-h-[56px] h-auto text-base md:text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Rocket className="w-5 h-5" />
            )}
            🚀 YES! Reserve with {isOneVariant ? "$1" : "$11"} NOW — Lock My 77% OFF
          </Button>
          <p className="text-[10px] text-muted-foreground mt-2">
            ✅ Fully refundable • ✅ Secure Stripe checkout • ✅ Deposit applied to final price
          </p>
        </motion.div>

        {/* ── Bridge Copy (Brunson storytelling) ── */}
        <motion.div
          className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 text-left shadow-soft mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
            <span className="font-bold text-foreground">
              Let me tell you something nobody in the wellness industry will
              admit:
            </span>{" "}
            every "gratitude journal" and "mindfulness app" on the market asks
            you to <em>think</em> your way to happiness.{" "}
            <span className="font-bold text-foreground">
              But your brain doesn't work that way.
            </span>
          </p>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
            The <MpfcTooltip /> — your{" "}
            <strong className="text-foreground">
              medial Prefrontal Cortex
            </strong>{" "}
            — only fires its full{" "}
            <strong className="text-primary">Dopamine × Serotonin</strong>{" "}
            cascade when you{" "}
            <em className="text-foreground font-semibold">
              receive genuine gratitude
            </em>
            , not when you journal about it alone in your room.
          </p>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
            The{" "}
            <strong className="text-foreground">
              mPFC Neuro-Hacker Wristband SMART
            </strong>{" "}
            is a{" "}
            <strong className="text-primary">zero-battery smart wearable</strong>{" "}
            with <strong className="text-foreground">NFC TAP technology</strong>{" "}
            that naturally activates your <MpfcTooltip /> to{" "}
            <strong className="text-primary">
              trigger a Dopamine × Serotonin spike on autopilot
            </strong>{" "}
            — the <em>happy chemicals</em> — every single day, without
            willpower, without an app, without thinking about it.
          </p>

          <p className="text-sm md:text-base text-foreground font-bold leading-relaxed">
            This isn't a bracelet.{" "}
            <span className="text-primary">
              This is the future of wearable neuroscience.
            </span>
          </p>
        </motion.div>

        {/* ── 8 Discoveries Grid ── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Based on the 8 Latest Neuroscience Discoveries
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DISCOVERIES.map((d, i) => (
              <div
                key={i}
                className="bg-card border border-border/40 rounded-xl p-3 flex flex-col items-center gap-1.5"
              >
                <d.icon className="w-5 h-5 text-primary" />
                <span className="text-[11px] font-semibold text-foreground text-center leading-tight">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Second Reserve CTA ── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={handleReserve}
            disabled={loading}
            className="w-full min-h-[56px] h-auto text-base md:text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Rocket className="w-5 h-5" />
            )}
            🚀 Reserve with {isOneVariant ? "$1" : "$11"} — Secure 77% OFF
          </Button>
        </motion.div>

        {/* ── Auth Gate ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <SmartWristbandAuth />
        </motion.div>

        {/* ── Bottom nudge ── */}
        <motion.p
          className="text-xs text-muted-foreground mt-6 max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <strong className="text-foreground">
            Experience first. Witness the future of non-battery-powered
            wearable Neuro-Hacks.
          </strong>{" "}
          Get early updates and be the first to see the{" "}
          <MpfcTooltip /> Neuro-Hacker Wristband SMART in action.
        </motion.p>
      </section>
    </div>
  );
};

export default SmartWristband;
