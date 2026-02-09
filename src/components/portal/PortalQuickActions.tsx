import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Zap, Gift, Share2, MessageCircle, Users, Coins,
  Copy, Check, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShortLinks } from "@/hooks/useShortLinks";
import { useToast } from "@/hooks/use-toast";
import GiftSmsDialog from "@/components/offer/GiftSmsDialog";

interface Props {
  referralCode: string;
  onOpenSocial: () => void;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  reward: string;
  icon: any;
  accent: string;
  isFree: boolean;
  onClick: () => void;
}

export default function PortalQuickActions({ referralCode, onOpenSocial }: Props) {
  const { toast } = useToast();
  const { getShareUrl } = useShortLinks();
  const [copied, setCopied] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);
  const [shortUrl, setShortUrl] = useState("");

  const rawUrl = `https://iamblessedaf.com/r/${referralCode}`;

  // Generate short link on mount
  useState(() => {
    getShareUrl(rawUrl, "portal-quick-actions", "/portal").then(setShortUrl);
  });

  const referralUrl = shortUrl || rawUrl;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast({ title: "Link copied! +5 BC 🪙", description: "Now share it everywhere!" });
    setTimeout(() => setCopied(false), 2000);
  }, [referralUrl, toast]);

  const shareNative = useCallback(async () => {
    const text = "🎁 I'm gifting you a FREE 'I Am Blessed AF' Wristband — just cover shipping!";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Free Gift!", text, url: referralUrl });
      } catch {}
    } else {
      copyLink();
    }
  }, [referralUrl, copyLink]);

  const shareWhatsApp = useCallback(() => {
    const msg = encodeURIComponent(
      `Hey! I'm gifting you a FREE 'I Am Blessed AF' Wristband 🎁 Claim yours here: ${referralUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    toast({ title: "+15 BC earned! 🪙" });
  }, [referralUrl, toast]);

  const actions: QuickAction[] = [
    {
      id: "copy-link",
      title: "Copy Your Link",
      description: "One tap — paste it anywhere",
      reward: "+5 BC",
      icon: copied ? Check : Copy,
      accent: "bg-secondary text-foreground",
      isFree: true,
      onClick: copyLink,
    },
    {
      id: "whatsapp",
      title: "Send via WhatsApp",
      description: "Gift a FREE wristband to a friend",
      reward: "+15 BC",
      icon: MessageCircle,
      accent: "bg-[hsl(142_70%_92%)] text-[hsl(142_70%_30%)]",
      isFree: true,
      onClick: shareWhatsApp,
    },
    {
      id: "sms-gift",
      title: "Send Gift via SMS",
      description: "Text a friend their FREE gift link",
      reward: "+15 BC",
      icon: Gift,
      accent: "bg-primary/10 text-primary",
      isFree: true,
      onClick: () => setSmsOpen(true),
    },
    {
      id: "social-post",
      title: "Post on Social Media",
      description: "TikTok, IG, X, Facebook — we wrote the caption",
      reward: "+30 BC",
      icon: Share2,
      accent: "bg-accent text-accent-foreground",
      isFree: true,
      onClick: onOpenSocial,
    },
    {
      id: "share-native",
      title: "Share Anywhere",
      description: "Use your phone's share menu",
      reward: "+5 BC",
      icon: Zap,
      accent: "bg-secondary text-foreground",
      isFree: true,
      onClick: shareNative,
    },
    {
      id: "bless-3",
      title: "Bless 3 Friends Today",
      description: "Send blessings to 3 people for bonus",
      reward: "+50 BC",
      icon: Users,
      accent: "bg-primary/10 text-primary",
      isFree: true,
      onClick: () => setSmsOpen(true),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Earn FREE Blessed Coins</h3>
            <p className="text-xs text-muted-foreground">Every action = BC rewards. All FREE.</p>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {actions.map((action, i) => (
            <motion.button
              key={action.id}
              onClick={action.onClick}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:bg-primary/[0.02] transition-all text-left group"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${action.accent}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{action.title}</p>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full shrink-0 uppercase">
                    Free
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{action.description}</p>
              </div>
              <div className="flex items-center gap-1 text-primary font-bold text-xs shrink-0">
                <Coins className="w-3 h-3" />
                {action.reward}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <GiftSmsDialog
        open={smsOpen}
        onOpenChange={setSmsOpen}
        shortUrl={referralUrl}
        sourcePage="/portal"
        onSuccess={() => toast({ title: "+15 BC earned! 🪙" })}
      />
    </>
  );
}
