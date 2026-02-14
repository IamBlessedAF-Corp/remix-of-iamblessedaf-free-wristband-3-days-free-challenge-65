import { motion } from "framer-motion";
import { Cpu, Zap, Brain, Sparkles, Rocket, Shield, Activity, Wifi } from "lucide-react";
import MpfcTooltip from "@/components/offer/MpfcTooltip";
import SmartWristbandAuth from "@/components/smart-wristband/SmartWristbandAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import logoImg from "@/assets/logo.png";

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

const SmartWristband = () => {
  usePageMeta({
    title: "Reserve Your mPFC Neuro-Hacker Wristband SMART | IamBlessedAF",
    description:
      "The world's first smart wearable neuro-hack. NFC TAP technology to activate your mPFC and trigger Dopamine × Serotonin spikes on autopilot.",
    image: "/og-wristband.png",
    url: "https://iamblessedaf.com/Reserve-your-Neuro-Hack-Wristband-SMART",
  });

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
