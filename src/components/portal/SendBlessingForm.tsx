import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, Copy, Check, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  userId: string;
  onBlessingCreated: () => void;
}

interface CreatedBlessing {
  recipientName: string;
  confirmUrl: string;
}

export default function SendBlessingForm({ userId, onBlessingCreated }: Props) {
  const { toast } = useToast();
  const [recipientName, setRecipientName] = useState("");
  const [sending, setSending] = useState(false);
  const [created, setCreated] = useState<CreatedBlessing | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSend = useCallback(async () => {
    const name = recipientName.trim();
    if (!name) {
      toast({ title: "Enter a name", description: "Who are you blessing?", variant: "destructive" });
      return;
    }
    if (name.length > 100) {
      toast({ title: "Name too long", description: "Keep it under 100 characters", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase
        .from("blessings")
        .insert({ sender_id: userId, recipient_name: name })
        .select("confirmation_token")
        .single();

      if (error) throw error;

      const token = data.confirmation_token;
      const confirmUrl = `${window.location.origin}/confirm/${token}`;

      setCreated({ recipientName: name, confirmUrl });
      setRecipientName("");
      onBlessingCreated();

      toast({ title: "Blessing created! 🙏", description: `Share the link with ${name}` });
    } catch (err: any) {
      toast({ title: "Couldn't create blessing", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  }, [recipientName, userId, onBlessingCreated, toast]);

  const copyLink = useCallback(() => {
    if (!created) return;
    navigator.clipboard.writeText(created.confirmUrl);
    setCopied(true);
    toast({ title: "Link copied! 📋" });
    setTimeout(() => setCopied(false), 2000);
  }, [created, toast]);

  const handleOneClickShare = useCallback(() => {
    if (!created) return;

    const message = `🙏 Hey ${created.recipientName}! I just sent you a blessing. Tap this link to confirm you received it: ${created.confirmUrl}`;
    const waWebUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    const waAppUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const smsUrl = `sms:?&body=${encodeURIComponent(message)}`;

    const isPreviewIframe = window.self !== window.top;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isPreviewIframe) {
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = waWebUrl;
          return;
        }
      } catch {
        // Cross-origin frame access can fail in some browsers.
      }

      const popup = window.open(waWebUrl, "_blank", "noopener,noreferrer");
      if (!popup) {
        window.location.href = smsUrl;
      }
      return;
    }

    if (!isMobile) {
      const popup = window.open(waWebUrl, "_blank", "noopener,noreferrer");
      if (!popup) {
        window.location.href = waWebUrl;
      }
      return;
    }

    let appOpened = false;
    const onVisibilityChange = () => {
      if (document.hidden) appOpened = true;
    };

    document.addEventListener("visibilitychange", onVisibilityChange, { once: true });
    window.location.href = waAppUrl;

    window.setTimeout(() => {
      if (!appOpened) {
        window.location.href = smsUrl;
      }
    }, 1400);
  }, [created]);

  const resetForm = () => {
    setCreated(null);
    setCopied(false);
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Heart className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Send a Blessing</h3>
          <p className="text-xs text-muted-foreground">Create a blessing link to share with someone</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!created ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-2"
          >
            <Input
              placeholder="Friend's name (e.g. Sarah)"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              maxLength={100}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !recipientName.trim()}
              className="shrink-0 gap-2"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Bless
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-foreground font-medium mb-1">
                ✨ Blessing for <strong>{created.recipientName}</strong> is ready!
              </p>
              <p className="text-xs text-muted-foreground break-all font-mono">
                {created.confirmUrl}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleOneClickShare} className="w-full gap-2">
                <Send className="w-4 h-4" />
                Send now (WhatsApp → SMS fallback)
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">
                If WhatsApp isn't available, your phone will open a regular text message with the same pre-filled message.
              </p>
              <Button onClick={copyLink} variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground">
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>

            <Button
              onClick={resetForm}
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Bless someone else
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
