import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, Copy, Check, Share2, Loader2, Plus } from "lucide-react";
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

  const shareLink = useCallback(async () => {
    if (!created) return;
    const text = `🙏 Hey ${created.recipientName}! I just sent you a blessing. Tap this link to confirm you received it:`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "You've been blessed!", text, url: created.confirmUrl });
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  }, [created, copyLink]);

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
              <Button
                onClick={() => {
                  if (!created) return;
                  const msg = `🙏 Hey ${created.recipientName}! I just sent you a blessing. Tap this link to confirm you received it:\n${created.confirmUrl}`;
                  const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
                  window.open(waUrl, "_blank", "noopener,noreferrer");
                }}
                className="w-full gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.613.613l4.458-1.495A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.767-6.262-2.064l-.438-.334-2.655.89.89-2.655-.334-.438A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                Send via WhatsApp
              </Button>
              <Button
                onClick={() => {
                  if (!created) return;
                  const msg = `🙏 Hey ${created.recipientName}! I just sent you a blessing. Tap this link to confirm you received it: ${created.confirmUrl}`;
                  const smsUrl = `sms:?&body=${encodeURIComponent(msg)}`;
                  window.open(smsUrl);
                }}
                variant="outline"
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                Send via Text Message
              </Button>
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
