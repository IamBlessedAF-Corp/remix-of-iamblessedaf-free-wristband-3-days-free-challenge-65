import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, MessageCircle, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGamificationStats } from "@/hooks/useGamificationStats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface GrokViralFooterProps {
  delay?: number;
  onSkip?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const DEFAULT_MESSAGE =
  "🎁 Someone thinks you're blessed! You've been gifted a FREE 'I Am Blessed AF' Wristband — just cover $9.95 shipping. Claim yours: https://iamblessedaf.com/offer/111-grok";

const GrokViralFooter = ({ delay = 0, onSkip }: GrokViralFooterProps) => {
  const { rewardShare } = useGamificationStats();
  const [smsOpen, setSmsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [friendName, setFriendName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendSms = async () => {
    if (!phone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setSending(true);
    try {
      const personalizedMessage = friendName.trim()
        ? `Hey ${friendName}! ${DEFAULT_MESSAGE}`
        : DEFAULT_MESSAGE;

      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: {
          to: phone.trim(),
          message: personalizedMessage,
          recipientName: friendName.trim() || null,
          sourcePage: "/offer/111/grok",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSent(true);
      toast.success("🎉 Gift SMS sent! +15 BC 🪙");
      rewardShare("sms");
      setTimeout(() => {
        setSmsOpen(false);
        setSent(false);
        setPhone("");
        setFriendName("");
      }, 2000);
    } catch (err: any) {
      console.error("SMS send error:", err);
      toast.error(err?.message || "Failed to send SMS. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleShareLink = async () => {
    const shareUrl = "https://iamblessedaf.com/offer/111-grok";
    const shareText = "🎁 I'm gifting you a FREE 'I Am Blessed AF' Wristband — just cover shipping!";

    if (navigator.share) {
      try {
        await navigator.share({ title: "Free Gift for You!", text: shareText, url: shareUrl });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast.success("Link copied! +5 BC 🪙");
      rewardShare("link");
    }
  };

  return (
    <>
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
      >
        <div className="bg-card border border-border/50 rounded-xl p-5 max-w-lg mx-auto shadow-soft mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Share2 className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground">
              🎁 Gift a FREE Wristband (Valued at $11)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Someone you're grateful for gets a <span className="font-bold text-primary">FREE 'I Am Blessed AF' Wristband</span> — 
            just <span className="font-bold text-foreground">$9.95 shipping</span>.
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Or upgrade: all 3 colors for <span className="font-bold text-foreground">$22 with FREE shipping</span> 🇺🇸
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setSmsOpen(true)}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary/20 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Send FREE Gift via SMS
            </button>
            <button
              onClick={handleShareLink}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary/20 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Gift Link
            </button>
          </div>
        </div>

        <a
          href="/challenge/thanks"
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Maybe later? → (We'll send a reminder email)
        </a>
      </motion.div>

      {/* SMS Dialog */}
      <Dialog open={smsOpen} onOpenChange={setSmsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Send a FREE Gift via SMS
            </DialogTitle>
            <DialogDescription>
              Your friend will receive a text with a link to claim their free wristband.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="friendName">Friend's Name (optional)</Label>
              <Input
                id="friendName"
                placeholder="e.g. Sarah"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="mt-1"
                disabled={sending || sent}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
                disabled={sending || sent}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                US numbers only. Include country code (+1).
              </p>
            </div>

            <Button
              onClick={handleSendSms}
              disabled={sending || sent || !phone.trim()}
              className="w-full"
            >
              {sent ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" /> Sent!
                </>
              ) : sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-1.5" /> Send Gift SMS
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GrokViralFooter;
