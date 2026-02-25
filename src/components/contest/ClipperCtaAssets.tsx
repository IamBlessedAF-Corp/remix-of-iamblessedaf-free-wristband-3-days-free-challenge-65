import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Download, Eye, X, Check, Smartphone, Monitor, Play, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import clipperTutorial from "@/assets/clipper-tutorial.mov";
import confetti from "canvas-confetti";

/* ── Downloadable overlay images (in public/) ── */
const overlayAssets = [
  {
    id: "free-wristband",
    label: "🎁 FREE Wristband CTA",
    description: "Best for: end-screen (last 3–5 sec)",
    file: "/cta-overlays/cta-free-wristband.png",
    bgColor: "bg-gradient-to-br from-red-600 to-red-800",
  },
  {
    id: "gratitude-challenge",
    label: "🧠 3-Day Challenge CTA",
    description: "Best for: end-screen or text overlay",
    file: "/cta-overlays/cta-gratitude-challenge.png",
    bgColor: "bg-gradient-to-br from-primary to-orange-600",
  },
  {
    id: "science-hook",
    label: "📊 Science Hook CTA",
    description: "Best for: neuroscience-style clips",
    file: "/cta-overlays/cta-science-hook.png",
    bgColor: "bg-gradient-to-br from-indigo-700 to-purple-900",
  },
  {
    id: "gift-friend",
    label: "💝 Gift a Friend CTA",
    description: "Best for: relationship/friend clips",
    file: "/cta-overlays/cta-gift-friend.png",
    bgColor: "bg-gradient-to-br from-pink-600 to-rose-800",
  },
];

/* ── Copy-paste captions per platform ── */
const getCaptionTemplates = (link: string, code?: string | null) => {
  const ownershipTag = code ? `#IAMBLESSED_${code}` : "#IAMBLESSED_YOURCODE";
  return [
  {
    label: "🎵 TikTok — Science Hook",
    text: `Gratitude literally rewires your brain. Not motivation — neuroscience. 🧠\n\nClaim your FREE Neuro-Hacker wristband → ${link}\n\n#3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF #GratitudeChallenge #BrainHack #Neuroscience #fyp #foryoupage #mindset #mentalhealthmatters`,
  },
  {
    label: "🎵 TikTok — Hustle Hook",
    text: `I'm getting paid to spread gratitude. Not kidding.\n\n$2.22 per clip. $1,111 bonus at 1M views.\n\nGet your FREE wristband → ${link}\n\n#3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF #SideHustle #CreatorEconomy #MoneyTok #GratitudeChallenge #fyp`,
  },
  {
    label: "📸 IG Reels — Emotional Hook",
    text: `3 days of gratitude texts = 27× more serotonin. Science says so. 🔥\n\nJoin the FREE 3-Day Neuro-Hacker Challenge & claim your wristband 🧠\n\n→ Link in bio or ${link}\n\n#3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF #GratitudeChallenge #ReelsViral #Neuroscience #MentalHealth #SelfImprovement #Mindfulness #Gratitude`,
  },
  {
    label: "📸 IG Reels — Gift Hook",
    text: `Tag someone who deserves a FREE gratitude wristband 🎁🙏\n\nEvery wristband honors Huberman's Neuroscience of Gratitude & donates 11 meals 🍽️\n\n→ ${link}\n\n#3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF #GratitudeChallenge #FreeGift #TagSomeone #Blessed #GiveBack #Reels`,
  },
  {
    label: "▶️ YouTube Shorts — Challenge Hook",
    text: `The 3-Day Neuro-Hacker Challenge is changing lives 🧠🔥\n\n3 days. 3 gratitude texts. Science-backed brain rewiring.\n\nJoin FREE + get your wristband → ${link}\n\n#3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF #GratitudeChallenge #Shorts #Neuroscience #BrainHack #MentalHealth`,
  },
  {
    label: "▶️ YouTube Shorts — Creator Earnings",
    text: `How I'm earning $2.22+ per clip just spreading gratitude 🙏💰\n\nThe Gratitude Clips Challenge pays you per verified view.\n\nGet your FREE wristband → ${link}\n\n#3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF #SideHustle #CreatorEconomy #Shorts #MakeMoneyOnline #GratitudeChallenge`,
  },
];
};

/* ── Overlay Preview Modal ── */
const OverlayPreview = ({ asset, onClose }: { asset: typeof overlayAssets[0]; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
    <div className="relative w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute -top-10 right-0 text-white/80 hover:text-white">
        <X className="w-6 h-6" />
      </button>
      <div className="bg-black rounded-[2rem] p-2 shadow-2xl border border-white/10">
        <img
          src={asset.file}
          alt={asset.label}
          className="rounded-[1.5rem] w-full"
        />
      </div>
      <p className="text-center text-white/60 text-xs mt-3">
        This is what your viewers see in the last 3–5 sec
      </p>
    </div>
  </div>
);

const handleDownload = (file: string, label: string) => {
  const a = document.createElement("a");
  a.href = file;
  a.download = `${label.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast.success(`"${label}" downloaded! Drag it into CapCut or your editor.`);
};

const ClipperCtaAssets = ({ referralLink, referralCode }: { referralLink?: string | null; referralCode?: string | null }) => {
  const [previewAsset, setPreviewAsset] = useState<typeof overlayAssets[0] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const { user } = useAuth();
  const hasCopiedBefore = useRef(false);

  const handleCopyReferralLink = async () => {
    const link = referralLink || "https://iamblessedaf.com/challenge";
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    if (!hasCopiedBefore.current && referralLink) {
      hasCopiedBefore.current = true;
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      toast.success("🎉 Referral link copied! Paste it in your TikTok/IG bio → viewers click → you earn!");
    } else {
      toast.success(referralLink ? "Referral link copied!" : "Link copied! Sign up first to get your unique referral link.");
    }
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const handleCopyCaption = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    toast.success("Caption copied! Paste in your post.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="px-4 py-12 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-4 py-1.5 mb-3">
            <Download className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-sm">Ready-Made CTAs — Download & Plug Into Your Clip</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">📲 CTA Overlays, End-Screens & Captions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            <strong className="text-foreground">Download these images</strong>, drag them into CapCut (or any editor),
            and place them over the <strong className="text-foreground">last 3–5 seconds</strong> of your clip.
            They tell viewers to grab the free wristband or join the challenge via your link.
            <strong className="text-foreground"> Viewer clicks → you earn.</strong>
          </p>

          {/* Copy Referral Link Button */}
          {user && (
            <div className="mt-4">
              <Button
                onClick={handleCopyReferralLink}
                className="gap-2 h-12 px-6 bg-foreground text-background hover:bg-foreground/90 font-bold text-base rounded-xl"
              >
                {linkCopied ? (
                  <><Check className="w-5 h-5" /> Link Copied!</>
                ) : (
                  <><Link2 className="w-5 h-5" /> Copy My Referral Link</>
                )}
              </Button>
              {referralLink && (
                <p className="text-xs text-primary font-mono mt-2 bg-primary/5 rounded-lg px-3 py-1.5 truncate max-w-sm mx-auto">
                  {referralLink}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                Paste this in your TikTok / IG / YouTube bio → viewers click → you earn
              </p>
            </div>
          )}
        </div>

        {/* 🎬 Video Tutorial */}
        <div className="mb-10">
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
              <Play className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">🎬 30-Sec Tutorial: How to Remix a Clip + Add CTA in CapCut</span>
            </div>
            <video
              src={clipperTutorial}
              controls
              playsInline
              preload="metadata"
              className="w-full aspect-video bg-black"
              poster=""
            />
            <p className="text-xs text-muted-foreground px-4 py-2">
              Watch this quick tutorial → then download the CTA overlays below and follow the same steps.
            </p>
          </div>
        </div>

        {/* Downloadable CTA Overlay Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {overlayAssets.map((asset, i) => (
            <motion.div
              key={asset.id}
              className="bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              {/* Thumbnail */}
              <div
                className="relative cursor-pointer group"
                onClick={() => setPreviewAsset(asset)}
              >
                <img
                  src={asset.file}
                  alt={asset.label}
                  className="w-full aspect-[9/16] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="p-2.5 space-y-2">
                <div>
                  <p className="font-semibold text-xs text-foreground leading-tight">{asset.label}</p>
                  <p className="text-[10px] text-muted-foreground">{asset.description}</p>
                </div>
                <Button
                  size="sm"
                  className="w-full text-xs gap-1.5 h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => handleDownload(asset.file, asset.label)}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PNG
                </Button>
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
            Your referral link is already included. Just copy, paste & post!
          </p>
          <div className="space-y-3">
            {getCaptionTemplates(referralLink || "https://iamblessedaf.com/challenge", referralCode).map((tmpl) => (
              <div key={tmpl.label} className="bg-card border border-border/50 rounded-xl p-4 space-y-2">
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
            <li>Open CapCut, InShot, or TikTok's editor</li>
            <li>Trim the gratitude clip to ~55 seconds</li>
            <li><strong className="text-foreground">Download a CTA overlay above</strong> and drag it onto the last 3–5 seconds</li>
            <li>Export and upload to TikTok / Reels / Shorts</li>
            <li>Paste your referral link in bio + add <strong className="text-primary">#3DayNeuroHackerChallenge</strong> + #IamBlessedAF in caption</li>
            <li><strong className="text-foreground">Submit your clip link in the dashboard → get paid on views</strong></li>
          </ol>
        </div>
      </motion.div>

      {previewAsset && (
        <OverlayPreview asset={previewAsset} onClose={() => setPreviewAsset(null)} />
      )}
    </section>
  );
};

export default ClipperCtaAssets;
