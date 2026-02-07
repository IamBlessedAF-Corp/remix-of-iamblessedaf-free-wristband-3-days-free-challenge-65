import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Copy, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SHARE_TEXTS = [
  {
    label: "Best Friend",
    emoji: "💙",
    relation: "best friend",
    text: "Hey! I just did something cool — sent you a surprise that'll make sense when it arrives 😏 Meanwhile, I wanted to say: I'm genuinely grateful to have you in my life. You've made more of a difference than you know. 💙 #IamBlessedAF",
  },
  {
    label: "Family",
    emoji: "❤️",
    relation: "parent or sibling",
    text: "Hey, just wanted to say something I don't say enough — thank you for everything you've done for me. I've been doing this gratitude challenge and it reminded me how blessed I am to have you. Love you ❤️ iamblessedaf.com",
  },
  {
    label: "Mentor",
    emoji: "🙏",
    relation: "mentor or partner",
    text: "I've been reflecting on the people who shaped my life, and you're at the top. Thank you for believing in me and pushing me to be better. Genuinely grateful 🙏 iamblessedaf.com",
  },
];

interface GptViralShareProps {
  referralLink?: string;
}

const GptViralShare = ({ referralLink = "https://iamblessedaf.com/r/{code}" }: GptViralShareProps) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [sharedCount, setSharedCount] = useState(0);

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
    navigator.clipboard.writeText(referralLink);
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
          Your Pack is on the way! 🎉
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Complete your <span className="font-bold text-foreground">Happiness Guarantee</span>:
          send a gratitude text to 3 people you appreciate.
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
        {SHARE_TEXTS.map((item, idx) => (
          <div
            key={idx}
            className="bg-card border border-border/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{item.emoji}</span>
              <p className="text-sm font-bold text-foreground">
                To your {item.relation}
              </p>
              <span className="text-xs text-muted-foreground ml-auto">{item.label}</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
              {item.text}
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShareSMS(item.text)}
                className="flex-1 text-xs h-9"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" />
                SMS
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShareWhatsApp(item.text)}
                className="flex-1 text-xs h-9"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                WhatsApp
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(item.text, idx)}
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
        ))}
      </div>

      {/* Referral block */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
        <Heart className="w-5 h-5 text-primary mx-auto mb-2" />
        <p className="text-sm font-bold text-foreground mb-1">
          Share the Blessing
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Invite 2 friends → they each get a surprise bonus with their first order.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyReferral}
          className="text-xs"
        >
          <Copy className="w-3.5 h-3.5 mr-1.5" />
          Copy My Referral Link
        </Button>
      </div>
    </motion.div>
  );
};

export default GptViralShare;
