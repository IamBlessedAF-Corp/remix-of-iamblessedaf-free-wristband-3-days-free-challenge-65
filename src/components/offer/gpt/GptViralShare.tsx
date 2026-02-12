import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Copy, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useShortLinks } from "@/hooks/useShortLinks";

const SHARE_TEXTS = [
  {
    label: "Best Friend",
    emoji: "💙",
    relation: "best friend",
    text: (url: string) =>
      `Hey! Someone who cares about you just sent you a FREE 'I Am Blessed AF' Wristband (valued at $11) 🎁 They're grateful for YOU. Claim yours here → ${url} — just cover shipping! 💙 #IamBlessedAF`,
  },
  {
    label: "Family",
    emoji: "❤️",
    relation: "parent or sibling",
    text: (url: string) =>
      `Someone who loves you just sent you a FREE 'I Am Blessed AF' Wristband (valued at $11) as a gratitude gift ❤️ They wanted you to know you're appreciated. Claim it here → ${url} — just cover shipping!`,
  },
  {
    label: "Mentor",
    emoji: "🙏",
    relation: "mentor or partner",
    text: (url: string) =>
      `You just received a FREE 'I Am Blessed AF' Wristband (valued at $11) from someone who's genuinely grateful for your impact 🙏 Claim yours → ${url} — just cover shipping. You deserve this.`,
  },
];

interface GptViralShareProps {
  referralLink?: string;
}

const GptViralShare = ({ referralLink }: GptViralShareProps) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [sharedCount, setSharedCount] = useState(0);
  const { getShareUrl } = useShortLinks();
  const [shortUrl, setShortUrl] = useState("https://iamblessedaf.com/");
  const [refShortUrl, setRefShortUrl] = useState(referralLink || "https://iamblessedaf.com/challenge");

  useEffect(() => {
    getShareUrl("https://iamblessedaf.com/", "gpt-viral-share", "/offer/111/gpt").then(setShortUrl);
    if (referralLink) {
      getShareUrl(referralLink, "gpt-referral", "/offer/111/gpt").then(setRefShortUrl);
    }
  }, [getShareUrl, referralLink]);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleShareSMS = (text: string) => {
    window.open(`sms:?body=${encodeURIComponent(text)}`, "_blank");
    setSharedCount((c) => c + 1);
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "share_sms_clicked" } }));
  };

  const handleShareWhatsApp = (text: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setSharedCount((c) => c + 1);
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "share_whatsapp_clicked" } }));
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(refShortUrl);
    toast.success("Referral link copied!");
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "referral_link_copied" } }));
  };

  return (
    <motion.div
      className="max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          🎁 Gift a FREE Wristband!
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Someone you love gets a <span className="font-bold text-primary">FREE wristband (valued at $11)</span> — 
          they just cover <span className="font-bold text-foreground">shipping</span>. Spread the gratitude! 🙏
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-10 h-2 rounded-full transition-colors ${
              i < sharedCount ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-2">
          {sharedCount}/3 sent
        </span>
      </div>

      {/* Share cards */}
      <div className="space-y-3 mb-6">
        {SHARE_TEXTS.map((item, idx) => {
          const messageText = item.text(shortUrl);
          return (
            <div key={idx} className="bg-card border border-border/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{item.emoji}</span>
                <p className="text-sm font-bold text-foreground">
                  To your {item.relation}
                </p>
                <span className="text-xs text-muted-foreground ml-auto">{item.label}</span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
                {messageText}
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShareSMS(messageText)}
                  className="flex-1 text-xs h-9"
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1" />
                  SMS
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShareWhatsApp(messageText)}
                  className="flex-1 text-xs h-9"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(messageText, idx)}
                  className="text-xs h-9 px-3"
                >
                  {copiedIdx === idx ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Referral block */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
        <Heart className="w-5 h-5 text-primary mx-auto mb-2" />
        <p className="text-sm font-bold text-foreground mb-1">
          🎁 Share the Blessing — Gift a FREE Wristband
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Your friends get a FREE wristband valued at $11 — just cover shipping. Spread the gratitude!
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyReferral}
          className="text-xs"
        >
          <Copy className="w-3.5 h-3.5 mr-1.5" />
          Copy My Gift Link
        </Button>
      </div>
    </motion.div>
  );
};

export default GptViralShare;
