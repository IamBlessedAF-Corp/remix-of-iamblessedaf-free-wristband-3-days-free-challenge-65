import { useState } from "react";
import { MessageCircle, Loader2, Check, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

interface GiftSmsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortUrl: string;
  sourcePage: string;
  onSuccess?: () => void;
}

/** Detect if number is non-US/Canada */
function isInternational(phone: string): boolean {
  const clean = phone.replace(/[^\d+]/g, "");
  if (!clean.startsWith("+")) return false;
  return !clean.startsWith("+1");
}

export default function GiftSmsDialog({
  open,
  onOpenChange,
  shortUrl,
  sourcePage,
  onSuccess,
}: GiftSmsDialogProps) {
  const [phone, setPhone] = useState("");
  const [friendName, setFriendName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const intl = isInternational(phone);

  const handleSend = async () => {
    if (!phone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setSending(true);
    try {
      const defaultMsg = `🎁 Someone thinks you're blessed! You've been gifted a FREE 'I Am Blessed AF' Wristband. Claim yours: ${shortUrl}`;
      const personalizedMessage = friendName.trim()
        ? `Hey ${friendName}! ${defaultMsg}`
        : defaultMsg;

      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: {
          to: phone.trim(),
          message: personalizedMessage,
          recipientName: friendName.trim() || null,
          sourcePage,
          // For international numbers, try WhatsApp first automatically
          preferWhatsApp: intl ? true : undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const channel = data?.channel === "whatsapp" ? "WhatsApp" : "SMS";
      setSent(true);
      toast.success(`🎉 Gift sent via ${channel}! +15 BC 🪙`);
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
        setSent(false);
        setPhone("");
        setFriendName("");
      }, 2000);
    } catch (err: any) {
      console.error("Send error:", err);
      toast.error(err?.message || "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Send a FREE Gift
          </DialogTitle>
          <DialogDescription>
            Your friend will receive a message with a link to claim their free wristband.
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
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Works worldwide — include country code (e.g. +1, +44, +52).
            </p>
          </div>

          {/* International WhatsApp note */}
          {intl && (
            <div className="bg-accent/50 border border-primary/20 rounded-lg px-3 py-2 text-xs text-muted-foreground flex items-start gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <span>
                International number detected — we'll send via <strong className="text-foreground">WhatsApp first</strong> (free for your friend). 
                If WhatsApp isn't available, we'll fall back to SMS.
              </span>
            </div>
          )}

          <Button
            onClick={handleSend}
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
                <MessageCircle className="w-4 h-4 mr-1.5" />
                {intl ? "Send via WhatsApp / SMS" : "Send Gift SMS"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
