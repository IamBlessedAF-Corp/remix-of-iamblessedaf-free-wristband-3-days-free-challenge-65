import { motion } from "framer-motion";
import { Rocket, Loader2 } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useWristbandWaitlist } from "@/hooks/useWristbandWaitlist";
import { useReservationCount } from "@/hooks/useReservationCount";
import { Button } from "@/components/ui/button";
import MpfcTooltip from "@/components/offer/MpfcTooltip";
import logoImg from "@/assets/logo.png";
import productWristbands from "@/assets/product-wristbands-new.avif";
import { Cpu, Zap, Brain, Sparkles, Shield, Activity, Wifi } from "lucide-react";

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

const ReserveSmartWristband = () => {
  usePageMeta({
    title: "Reserve Your mPFC Neuro-Hacker Wristband SMART | IamBlessedAF",
    description: "Reserve the world's first smart wearable neuro-hack with $11 and lock 77% OFF.",
    image: "/og-wristband.png",
    url: "https://iamblessedaf.com/Reserve-a-SMART-wristband",
  });

  const { startCheckout, loading } = useStripeCheckout();
  const { count: waitlistCount } = useWristbandWaitlist();
  const { count: reservationCount } = useReservationCount();

  const variant = new URLSearchParams(window.location.search).get("variant");
  const isOneVariant = variant === "1";

  const handleReserve = () => {
    startCheckout(isOneVariant ? ("kickstarter-1" as any) : ("kickstarter-11" as any));
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <section className="relative py-12 px-4 text-center max-w-2xl mx-auto">
        <motion.img
          src={logoImg}
          alt="IamBlessedAF"
          className="h-10 mx-auto mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Social proof */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-primary/30 border-2 border-background" />
                ))}
              </div>
              <span className="text-sm font-bold text-foreground">
                {waitlistCount.toLocaleString()}+ on waitlist
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            </div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
              <Rocket className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-foreground">
                {reservationCount.toLocaleString()} reserved
              </span>
            </div>
          </div>
        </motion.div>

        <motion.h1
          className="text-3xl md:text-4xl font-black leading-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Reserve Your{" "}
          <span className="text-primary">mPFC Neuro-Hacker Wristband SMART</span> 🧠
        </motion.h1>

        {/* Product image */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", duration: 0.6 }}
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
          {/* NFC Badge */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-full px-4 py-2">
              <svg viewBox="0 0 100 100" className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="50" cy="50" r="46" />
                <path d="M58 28c2-1 4-1 5 1l0 42c0 2-2 4-4 3" />
                <path d="M42 72c-2 1-4 1-5-1l0-42c0-2 2-4 4-3" />
                <path d="M42 52l16-12" />
                <path d="M26 44c-2-2-3-4-3-7" />
                <path d="M22 48c-4-4-6-8-6-14" />
                <path d="M74 56c2 2 3 4 3 7" />
                <path d="M78 52c4 4 6 8 6 14" />
              </svg>
              <span className="text-sm font-black text-destructive uppercase tracking-wide">NFC TAP Technology</span>
            </div>
          </div>
        </motion.div>

        {/* Reserve CTA */}
        <motion.div
          className="mb-8 bg-card border-2 border-primary/30 rounded-2xl p-5 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
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

        {/* Bridge copy */}
        <motion.div
          className="bg-card border border-border/50 rounded-2xl p-5 md:p-6 text-left shadow-soft mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
            <span className="font-bold text-foreground">Let me tell you something nobody in the wellness industry will admit:</span>{" "}
            every "gratitude journal" and "mindfulness app" on the market asks you to <em>think</em> your way to happiness.{" "}
            <span className="font-bold text-foreground">But your brain doesn't work that way.</span>
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
            The <MpfcTooltip /> — your <strong className="text-foreground">medial Prefrontal Cortex</strong> — only fires its full{" "}
            <strong className="text-primary">Dopamine × Serotonin</strong> cascade when you{" "}
            <em className="text-foreground font-semibold">receive genuine gratitude</em>, not when you journal about it alone in your room.
          </p>
          <p className="text-sm md:text-base text-foreground font-bold leading-relaxed">
            This isn't a bracelet.{" "}
            <span className="text-primary">This is the future of wearable neuroscience.</span>
          </p>
        </motion.div>

        {/* 8 Discoveries */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Based on the 8 Latest Neuroscience Discoveries
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DISCOVERIES.map((d, i) => (
              <div key={i} className="bg-card border border-border/40 rounded-xl p-3 flex flex-col items-center gap-1.5">
                <d.icon className="w-5 h-5 text-primary" />
                <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{d.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Second CTA */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
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

        <motion.p
          className="text-xs text-muted-foreground mt-6 max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <strong className="text-foreground">
            Experience first. Witness the future of non-battery-powered wearable Neuro-Hacks.
          </strong>
        </motion.p>
      </section>
    </div>
  );
};

export default ReserveSmartWristband;
