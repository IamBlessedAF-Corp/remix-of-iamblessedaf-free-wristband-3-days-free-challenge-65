import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gift, Scissors } from "lucide-react";

interface Props {
  logo: string;
  onJoin: () => void;
  variant?: "A" | "B";
}

const GratitudeClippersHero = ({ logo, onJoin, variant = "B" }: Props) => (
  <section className="px-4 pt-10 pb-6 max-w-3xl mx-auto">
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <img src={logo} alt="I am Blessed AF" className="w-full max-w-[200px] h-auto object-contain mx-auto mb-6" />

      {variant === "A" ? (
        <>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-tight">
            A Neuroscience-Backed Viral <span className="text-primary">Gratitude Challenge</span><br />
            Clip It. Post It. <span className="text-primary">Get Paid $2.22 – $1,111.</span> 🧠
          </h1>
          <p className="text-lg text-muted-foreground mb-4 max-w-xl mx-auto leading-relaxed">
            We give you <strong className="text-foreground">viral gratitude videos</strong> backed by neuroscience.
            You <strong className="text-foreground">clip 60 seconds</strong>, add our free CTA end-screen, and post it on TikTok / Reels / Shorts with your referral link.
          </p>
          <motion.div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-2xl px-5 py-3 mb-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Gift className="w-6 h-6 text-primary shrink-0" />
            <div className="text-left">
              <p className="text-lg md:text-xl font-black text-primary leading-tight">+ FREE $3,300 Marketing Credit</p>
              <p className="text-[11px] text-muted-foreground">Same system Inc 5000 companies paid $25,000 for — yours FREE for 30 days</p>
            </div>
          </motion.div>
        </>
      ) : (
        <>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-tight">
            Remix Viral Gratitude Clips.<br />
            Add Our CTA. <span className="text-primary">Get Paid $2.22 – $1,111.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-4 max-w-xl mx-auto leading-relaxed">
            We give you <strong className="text-foreground">viral gratitude videos</strong> from Tony Robbins, Huberman, Joe Dispenza & more.
            You <strong className="text-foreground">clip 60 seconds</strong>, add our free CTA end-screen
            (e.g. "Claim your FREE wristband"), and post it on TikTok / Reels / Shorts with your referral link.
          </p>
        </>
      )}

      {/* Crystal-clear 3-step */}
      <div className="bg-card border border-border/50 rounded-xl p-4 max-w-md mx-auto mb-6">
        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
          <Scissors className="w-3.5 h-3.5" /> What You Actually Do
        </p>
        <div className="flex flex-col gap-2.5 text-left">
          {[
            "Pick a clip from our Content Vault (Tony Robbins, Huberman, etc.)",
            "Add our CTA end-screen: \"Claim your FREE wristband\" or \"Join the 3-Day Gratitude Challenge\"",
            "Post on TikTok/Reels/Shorts with #IamBlessedAF + your referral link in bio",
          ].map((line, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <span className="text-primary font-bold text-xs mt-0.5 shrink-0">{i + 1}.</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 max-w-sm mx-auto mb-6 text-left">
        {[
          "No original content needed — we provide the clips",
          "$2.22 minimum per clip, even at 1k views",
          "Download ready-made CTA overlays below 👇",
        ].map((line) => (
          <div key={line} className="flex items-start gap-2.5 text-sm text-foreground">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{line}</span>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground h-13 px-8 text-base"
        onClick={onJoin}
      >
        Start Earning With Gratitude
      </Button>

      <p className="text-xs text-muted-foreground mt-3">
        100% free · No followers required · We give you everything you need
      </p>
    </motion.div>
  </section>
);

export default GratitudeClippersHero;
