import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Eye, X, Check, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CtaAsset {
  id: string;
  label: string;
  description: string;
  ctaText: string;
  format: "end-screen" | "overlay" | "caption";
  bgColor: string;
  textColor: string;
  accentColor: string;
}

const ctaAssets: CtaAsset[] = [
  {
    id: "free-wristband",
    label: "FREE Wristband CTA",
    description: "Best for: end-screen (last 3–5 sec)",
    ctaText: "🎁 Claim Your FREE\nGratitude Wristband\niamblessedaf.com",
    format: "end-screen",
    bgColor: "bg-gradient-to-br from-red-600 to-red-800",
    textColor: "text-white",
    accentColor: "border-yellow-400",
  },
  {
    id: "gratitude-challenge",
    label: "3-Day Challenge CTA",
    description: "Best for: end-screen or text overlay",
    ctaText: "🧠 Join the FREE\n3-Day Gratitude Challenge\nLink in bio 👇",
    format: "end-screen",
    bgColor: "bg-gradient-to-br from-primary to-orange-600",
    textColor: "text-white",
    accentColor: "border-white/50",
  },
  {
    id: "science-hook",
    label: "Science Hook CTA",
    description: "Best for: neuroscience-style clips",
    ctaText: "📊 27× More Serotonin?\nGet Your Gratitude Trigger\nFREE → Link in Bio",
    format: "overlay",
    bgColor: "bg-gradient-to-br from-indigo-700 to-purple-900",
    textColor: "text-white",
    accentColor: "border-cyan-400",
  },
  {
    id: "wristband-gift",
    label: "Gift a Friend CTA",
    description: "Best for: relationship/friend clips",
    ctaText: "💝 Send a FREE Wristband\nTo Someone You're\nGrateful For\niamblessedaf.com",
    format: "end-screen",
    bgColor: "bg-gradient-to-br from-pink-600 to-rose-800",
    textColor: "text-white",
    accentColor: "border-pink-300",
  },
];

const captionTemplates = [
  {
    label: "🎁 Free Wristband Caption",
    text: "Gratitude changes your brain chemistry. Science says so. 🧠\n\nClaim your FREE gratitude wristband → link in bio\n\n#IamBlessedAF #GratitudeChallenge #BrainHack #Neuroscience #Gratitude",
  },
  {
    label: "🧠 Challenge Caption",
    text: "3 days of gratitude texts = 27× more serotonin 🔥\n\nJoin the FREE 3-Day Gratitude Challenge → link in bio\n\n#IamBlessedAF #GratitudeChallenge #MentalHealth #Mindset",
  },
  {
    label: "💪 Hustle Caption",
    text: "I'm getting paid to spread gratitude. Not kidding.\n\n$2.22 per clip. $1,111 bonus at 1M views. \n\nClaim your FREE wristband → link in bio\n\n#IamBlessedAF #SideHustle #CreatorEconomy #GratitudeChallenge",
  },
];

const CtaPreview = ({ asset, onClose }: { asset: CtaAsset; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
    <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute -top-10 right-0 text-white/80 hover:text-white">
        <X className="w-6 h-6" />
      </button>
      {/* Phone mockup */}
      <div className="relative mx-auto" style={{ maxWidth: "280px" }}>
        <div className="bg-black rounded-[2rem] p-2 shadow-2xl border border-white/10">
          <div className={`${asset.bgColor} rounded-[1.5rem] aspect-[9/16] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden`}>
            {/* Fake video background hint */}
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 space-y-4">
              <p className={`${asset.textColor} text-xl font-black leading-tight whitespace-pre-line drop-shadow-lg`}>
                {asset.ctaText}
              </p>
              <div className={`border-2 ${asset.accentColor} rounded-full px-6 py-2`}>
                <p className={`${asset.textColor} text-sm font-bold`}>TAP LINK IN BIO</p>
              </div>
            </div>
            {/* Duration hint */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
              <span className="bg-black/60 text-white/80 text-[10px] px-3 py-1 rounded-full">
                ← Add this to last 3–5 sec of your clip
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ClipperCtaAssets = () => {
  const [previewAsset, setPreviewAsset] = useState<CtaAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCaption = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    toast.success("Caption copied! Paste in your post.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="px-4 py-12 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-4 py-1.5 mb-3">
            <Download className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-sm">Ready-Made CTAs — Just Plug & Post</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">📲 CTA End-Screens & Captions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These are the <strong className="text-foreground">call-to-actions you add to the end of your clips</strong>.
            They tell viewers to claim their free wristband or join the gratitude challenge via your link.
            <strong className="text-foreground"> This is how you get paid — viewers click → you earn.</strong>
          </p>
        </div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {ctaAssets.map((asset, i) => (
            <motion.div
              key={asset.id}
              className="bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              {/* Mini preview */}
              <div
                className={`${asset.bgColor} aspect-[16/9] flex items-center justify-center p-4 cursor-pointer relative group`}
                onClick={() => setPreviewAsset(asset)}
              >
                <p className={`${asset.textColor} text-sm font-bold text-center whitespace-pre-line leading-tight drop-shadow`}>
                  {asset.ctaText}
                </p>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="p-3 space-y-2">
                <div>
                  <p className="font-semibold text-sm text-foreground">{asset.label}</p>
                  <p className="text-xs text-muted-foreground">{asset.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs gap-1.5 h-8"
                    onClick={() => setPreviewAsset(asset)}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs gap-1.5 h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => {
                      navigator.clipboard.writeText(asset.ctaText.replace(/\n/g, " "));
                      toast.success(`"${asset.label}" text copied! Add to your clip editor.`);
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Copy CTA Text
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Caption Templates */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            Copy-Paste Caption Templates
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Use these captions when you post your clip. Just replace "link in bio" with your actual referral link.
          </p>
          <div className="space-y-3">
            {captionTemplates.map((tmpl) => (
              <div
                key={tmpl.label}
                className="bg-card border border-border/50 rounded-xl p-4 space-y-2"
              >
                <p className="text-sm font-semibold text-foreground">{tmpl.label}</p>
                <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed font-mono bg-secondary/30 rounded-lg p-3">
                  {tmpl.text}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 h-8"
                  onClick={() => handleCopyCaption(tmpl.text, tmpl.label)}
                >
                  {copiedId === tmpl.label ? (
                    <><Check className="w-3.5 h-3.5" /> Copied!</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" /> Copy Caption</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* How to add CTA */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-5">
          <p className="text-foreground font-semibold mb-2">🎬 How to Add the CTA to Your Clip</p>
          <ol className="text-muted-foreground text-sm space-y-1.5 list-decimal list-inside">
            <li>Open your video editor (CapCut, InShot, or even TikTok's editor)</li>
            <li>Trim the gratitude clip to ~55 seconds</li>
            <li>Add a text overlay with one of the CTAs above for the last 3–5 seconds</li>
            <li>Export and upload to TikTok / Reels / Shorts</li>
            <li>Paste your referral link in bio + add #IamBlessedAF in caption</li>
            <li><strong className="text-foreground">Submit your clip link in the dashboard → get paid on views</strong></li>
          </ol>
        </div>
      </motion.div>

      {previewAsset && (
        <CtaPreview asset={previewAsset} onClose={() => setPreviewAsset(null)} />
      )}
    </section>
  );
};

export default ClipperCtaAssets;
