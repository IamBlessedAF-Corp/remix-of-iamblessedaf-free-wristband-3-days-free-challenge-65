import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Coins, ExternalLink, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useShortLinks } from "@/hooks/useShortLinks";

interface Props {
  referralCode: string;
  displayName: string | null;
  open: boolean;
  onClose: () => void;
}

interface PlatformConfig {
  id: string;
  name: string;
  emoji: string;
  color: string;
  reward: number;
  caption: string;
  hashtags: string;
  shareUrl: (url: string, text: string) => string;
}

export default function PortalSocialShare({ referralCode, displayName, open, onClose }: Props) {
  const { toast } = useToast();
  const { getShareUrl } = useShortLinks();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shortUrl, setShortUrl] = useState("");

  const name = displayName || "a friend";
  const rawUrl = `https://iamblessedaf.com/r/${referralCode}`;

  useEffect(() => {
    if (open) {
      getShareUrl(rawUrl, "portal-social-share", "/portal").then(setShortUrl);
    }
  }, [open, rawUrl, getShareUrl]);

  const url = shortUrl || rawUrl;

  const codeSuffix = referralCode && referralCode.length > 10 ? referralCode.slice(10) : referralCode;
  const ownershipTag = `#IAMBLESSED_${codeSuffix}`;

  const PLATFORMS: PlatformConfig[] = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      emoji: "💬",
      color: "bg-[hsl(120_100%_50%)] text-[hsl(0_0%_100%)]",
      reward: 40,
      caption: `🎁 I just blessed someone with a FREE Neuro-Hacker Wristband! 🙏\n\nEvery wristband worn honors Andrew Huberman's Gratitude Research & donates 11 meals to Tony Robbins' "1 Billion Meals Challenge" 🍽️\n\nGet yours FREE: ${url}\n\n#3DayNeuroHackerChallenge ${ownershipTag}`,
      hashtags: `#IamBlessedAF #BlessedAF #Gratitude ${ownershipTag}`,
      shareUrl: (u, t) => `https://wa.me/?text=${encodeURIComponent(t)}`,
    },
    {
      id: "tiktok",
      name: "TikTok",
      emoji: "🎵",
      color: "bg-[hsl(0_0%_0%)] text-[hsl(0_0%_100%)]",
      reward: 30,
      caption: `I just blessed someone with a FREE gratitude Neuro-Hacker Wristband 🙏🎁\n\nEvery wristband honors Huberman's Neuroscience of Gratitude & donates 11 meals to Tony Robbins' "1 Billion Meals Challenge" 🍽️\n\nLink in bio to get yours FREE 👇\n\n${url}`,
      hashtags: `#3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF #GratitudeChallenge #FreeGift #BlessedAF #Gratitude`,
      shareUrl: (u, t) => `https://www.tiktok.com/`,
    },
    {
      id: "instagram",
      name: "Instagram",
      emoji: "📸",
      color: "bg-[hsl(330_60%_50%)] text-[hsl(0_0%_100%)]",
      reward: 30,
      caption: `I'm on a mission to honor Andrew Huberman's Gratitude Research 🙏🧠\n\nI got my FREE "I Am Blessed AF" Neuro-Hacker Wristband and YOU can get one too — link in my bio!\n\nEvery wristband = 11 meals donated to Tony Robbins' "1 Billion Meals Challenge" 🍽️🎁\n\n${url}`,
      hashtags: `#3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF #Blessed #GratitudeChallenge #FreeWristband #GiveBack`,
      shareUrl: (u, t) => `https://www.instagram.com/`,
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      emoji: "𝕏",
      color: "bg-foreground text-background",
      reward: 30,
      caption: `I'm gifting FREE "I Am Blessed AF" Neuro-Hacker Wristbands 🎁\n\nEach one honors Huberman's Gratitude Research & donates 11 meals to Tony Robbins' "1 Billion Meals Challenge" 🍽️\n\nClaim yours: ${url}\n\n#3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF`,
      hashtags: `#IamBlessedAF #Gratitude ${ownershipTag}`,
      shareUrl: (u, t) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}`,
    },
    {
      id: "facebook",
      name: "Facebook",
      emoji: "👤",
      color: "bg-[hsl(220_60%_50%)] text-[hsl(0_0%_100%)]",
      reward: 30,
      caption: `🎁 I'm gifting FREE "I Am Blessed AF" Neuro-Hacker Wristbands!\n\nEvery wristband honors Andrew Huberman's Gratitude Research & donates 11 meals to Tony Robbins' "1 Billion Meals Challenge" 🍽️\n\nClaim yours here:\n${url}\n\nSpread the gratitude 🙏 #3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF`,
      hashtags: `#IamBlessedAF #Blessed #Gratitude ${ownershipTag}`,
      shareUrl: (u, t) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}&quote=${encodeURIComponent(t)}`,
    },
    {
      id: "snapchat",
      name: "Snapchat",
      emoji: "👻",
      color: "bg-[hsl(50_100%_50%)] text-[hsl(0_0%_0%)]",
      reward: 20,
      caption: `🎁 FREE wristband alert! Claim your "I Am Blessed AF" wristband — each one donates 11 meals to Tony Robbins' "1 Billion Meals Challenge" 🍽️🙏\n\n${url}\n\n#3DayNeuroHackerChallenge ${ownershipTag}`,
      hashtags: `#IamBlessedAF ${ownershipTag}`,
      shareUrl: (u, t) => `https://www.snapchat.com/`,
    },
    {
      id: "threads",
      name: "Threads",
      emoji: "🧵",
      color: "bg-foreground text-background",
      reward: 20,
      caption: `Wearing my "I Am Blessed AF" wristband 🙏\n\nEvery wristband honors Huberman's Gratitude Research & donates 11 meals to Tony Robbins' "1 Billion Meals Challenge" 🍽️\n\nGet yours FREE: ${url}\n\n#3DayNeuroHackerChallenge ${ownershipTag} #IamBlessedAF`,
      hashtags: `#IamBlessedAF #Gratitude ${ownershipTag}`,
      shareUrl: (u, t) => `https://www.threads.net/intent/post?text=${encodeURIComponent(t + " " + u)}`,
    },
  ];

  const copyCaption = useCallback((platform: PlatformConfig) => {
    const fullText = `${platform.caption}\n\n${platform.hashtags}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(platform.id);
    toast({ title: `Caption copied! +${platform.reward} BC 🪙`, description: `Now paste it on ${platform.name}` });
    setTimeout(() => setCopiedId(null), 2000);
  }, [toast]);

  const openPlatform = useCallback((platform: PlatformConfig) => {
    const shareLink = platform.shareUrl(url, platform.caption);
    if (platform.id === "twitter" || platform.id === "facebook" || platform.id === "threads") {
      window.open(shareLink, "_blank");
    } else {
      // For TikTok/IG/Snapchat: copy caption first, then open app
      copyCaption(platform);
    }
  }, [url, copyCaption]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Post & Earn BC</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Intro */}
        <div className="px-4 py-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
            <p className="text-sm font-bold text-foreground">
              📱 Post on ANY platform = <span className="text-primary">FREE BC coins</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              We wrote the captions for you. Just copy, paste & post!
            </p>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
          {PLATFORMS.map((platform, i) => (
            <motion.div
              key={platform.id}
              className="bg-card border border-border/50 rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Platform header */}
              <div className="flex items-center justify-between p-3 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${platform.color}`}>
                    {platform.emoji}
                  </span>
                  <span className="text-sm font-bold text-foreground">{platform.name}</span>
                </div>
                <div className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                  <Coins className="w-3 h-3" />
                  +{platform.reward} BC
                </div>
              </div>

              {/* Caption preview */}
              <div className="p-3">
                <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground whitespace-pre-line max-h-24 overflow-y-auto leading-relaxed">
                  {platform.caption}
                </div>
                <p className="text-[10px] text-primary/70 mt-1.5 font-medium">{platform.hashtags}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 p-3 pt-0">
                <Button
                  onClick={() => copyCaption(platform)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs font-bold gap-1.5"
                >
                  {copiedId === platform.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-primary" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Caption
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => openPlatform(platform)}
                  size="sm"
                  className="flex-1 h-9 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open {platform.name}
                </Button>
              </div>
            </motion.div>
          ))}

          {/* Bottom tip */}
          <div className="bg-accent/40 border border-primary/15 rounded-xl p-4 mt-4">
            <p className="text-xs text-muted-foreground">
              💡 <strong className="text-foreground">Pro Tip:</strong> Post a video/story showing your wristband for{" "}
              <strong className="text-primary">2x BC bonus</strong>. Tag <strong>@iamblessedaf</strong> so we can verify & reward you!
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
