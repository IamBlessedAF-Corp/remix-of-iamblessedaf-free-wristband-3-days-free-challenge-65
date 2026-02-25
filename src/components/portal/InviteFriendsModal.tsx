import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Users, Send, X, Check, Loader2, Plus, Trash2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MpfcTooltip from "@/components/offer/MpfcTooltip";

interface FriendInput {
  name: string;
  phone: string;
  message: string;
}

const DEFAULT_MESSAGE = (friendName: string, senderName: string) =>
  `Hey ${friendName}! 🧠\n\nIt's ${senderName}. I just joined the Neuro-Hacker Gratitude Challenge and I wanted to start with YOU.\n\nDid you know that receiving genuine gratitude fires up your mPFC and makes you up to 27x happier?\n\nSo here it is: Thank you for being in my life. Genuinely. ❤️\n\n🎯 YOUR CHALLENGE: Forward this to 2 people YOU'RE grateful for!`;

const getMessageForFriend = (friendName: string, senderName: string) =>
  DEFAULT_MESSAGE(friendName || "friend", senderName);

interface InviteFriendsModalProps {
  open: boolean;
  onClose: () => void;
  referralCode: string;
  displayName: string;
}

export default function InviteFriendsModal({
  open,
  onClose,
  referralCode,
  displayName,
}: InviteFriendsModalProps) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendInput[]>([
    { name: "", phone: "", message: "" },
  ]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [results, setResults] = useState<Array<{ name: string; success: boolean; error?: string }>>([]);

  const referralLink = referralCode
    ? `https://iamblessedaf.com/r/${referralCode}`
    : "https://iamblessedaf.com/challenge";

  const senderName = displayName || "Someone special";

  const updateFriend = (idx: number, field: keyof FriendInput, value: string) => {
    setFriends((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addFriend = () => {
    if (friends.length < 10) {
      setFriends((prev) => [...prev, { name: "", phone: "", message: "" }]);
    }
  };

  const removeFriend = (idx: number) => {
    if (friends.length > 1) {
      setFriends((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSend = async () => {
    // Check if any friend has a name but is missing a phone number
    const friendsWithNames = friends.filter((f) => f.name.trim());
    const missingPhones = friendsWithNames.filter((f) => !f.phone.trim());
    
    if (friendsWithNames.length === 0) {
      toast.error("Add at least 1 friend with name and phone number");
      return;
    }

    if (missingPhones.length > 0) {
      toast.error(`Enter phone number for: ${missingPhones.map(f => f.name.trim()).join(", ")}`);
      return;
    }

    // Validate phone format (basic: at least 10 digits)
    const invalidPhones = friendsWithNames.filter((f) => {
      const digits = f.phone.replace(/[^\d]/g, "");
      return digits.length < 10;
    });

    if (invalidPhones.length > 0) {
      toast.error(`Invalid phone number for: ${invalidPhones.map(f => f.name.trim()).join(", ")}. Include country code (e.g. +1)`);
      return;
    }

    const validFriends = friendsWithNames;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp-invite", {
        body: {
          friends: validFriends.map((f) => ({
            name: f.name.trim(),
            phone: f.phone.trim(),
            message: getMessageForFriend(f.name.trim(), senderName),
          })),
          senderName,
          referralLink,
        },
      });

      if (error) throw error;

      setResults(data.results || []);
      setSent(true);

      const successCount = (data.results || []).filter((r: any) => r.success).length;
      if (successCount > 0) {
        toast.success(`🎉 ${successCount} invite(s) sent via WhatsApp!`);
      }

      // Mark congrats as completed locally
      localStorage.setItem("congrats_neurohacker_completed", "completed");
    } catch (err) {
      console.error("WhatsApp invite error:", err);
      toast.error("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleSkip = async () => {
    localStorage.setItem("congrats_neurohacker_completed", "skipped");
    if (user) {
      await supabase
        .from("creator_profiles")
        .update({ congrats_completed: "skipped" })
        .eq("user_id", user.id);
    }
    onClose();
  };

  const handleDone = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && (sent ? handleDone() : undefined)}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border/40 p-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground">
                  {sent ? "Invites Sent!" : "Nominate Friends for the Challenge"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {sent
                    ? "Your friends will receive your message via WhatsApp"
                    : "Send a gratitude message via WhatsApp"}
                </p>
              </div>
            </div>
            {!sending && (
              <Button
                variant="ghost"
                size="icon"
                onClick={sent ? handleDone : handleSkip}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="p-5 space-y-5">
          <AnimatePresence mode="wait">
            {sent ? (
              /* ═══ SUCCESS STATE ═══ */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="text-center space-y-3 py-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-black text-foreground">
                    🧠 Neuro-Hacker Activated!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Your friends will receive your gratitude message + a free wristband.
                    Each invite feeds 11 children. 🌍
                  </p>
                </div>

                {/* Results */}
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        r.success
                          ? "bg-primary/5 border-primary/20"
                          : "bg-destructive/5 border-destructive/20"
                      }`}
                    >
                      {r.success ? (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-destructive shrink-0" />
                      )}
                      <span className="text-sm font-medium text-foreground">{r.name}</span>
                      {!r.success && (
                        <span className="text-xs text-destructive ml-auto">{r.error}</span>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleDone}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
                >
                  Enter the Portal 🚀
                </Button>
              </motion.div>
            ) : (
              /* ═══ FORM STATE ═══ */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Science hook */}
                <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    🧠 <strong className="text-foreground">Neuro-Hack:</strong> Receiving
                    genuine gratitude activates your friend's <MpfcTooltip />, making them up to{" "}
                    <strong className="text-foreground">27× happier</strong>. Send your
                    gratitude via WhatsApp now.
                  </p>
                </div>

                {/* Friend inputs */}
                {friends.map((friend, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-card border border-border/40 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">
                          Friend {idx + 1}
                        </span>
                      </div>
                      {friends.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFriend(idx)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Name"
                        value={friend.name}
                        onChange={(e) => updateFriend(idx, "name", e.target.value)}
                        className="h-10 text-sm rounded-lg"
                        maxLength={50}
                      />
                      <div className="space-y-1">
                        <Input
                          placeholder="+1 (555) 123-4567"
                          value={friend.phone}
                          onChange={(e) => updateFriend(idx, "phone", e.target.value)}
                          className={`h-10 text-sm rounded-lg ${friend.name.trim() && !friend.phone.trim() ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                          type="tel"
                          maxLength={20}
                          required
                        />
                        {friend.name.trim() && !friend.phone.trim() && (
                          <p className="text-[10px] text-destructive font-medium">Required — don't waste your invite!</p>
                        )}
                      </div>
                    </div>

                    {friend.name && (
                      <div className="bg-muted/20 rounded-lg p-3 border border-border/20">
                        <p className="text-[10px] text-muted-foreground mb-1 font-medium">Message preview:</p>
                        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                          {getMessageForFriend(friend.name, senderName).substring(0, 150)}...
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Add friend button */}
                {friends.length < 10 && (
                  <Button
                    variant="outline"
                    onClick={addFriend}
                    className="w-full h-10 rounded-xl text-sm gap-2 border-dashed"
                  >
                    <Plus className="w-4 h-4" />
                    Add friend ({friends.length}/10)
                  </Button>
                )}

                {/* Send button */}
                <Button
                  onClick={handleSend}
                  disabled={sending || !friends.some((f) => f.name.trim() && f.phone.trim())}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending via WhatsApp...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send via WhatsApp ({friends.filter((f) => f.name.trim() && f.phone.trim()).length})
                    </>
                  )}
                </Button>

                {/* Skip */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  disabled={sending}
                  className="w-full text-xs text-muted-foreground/60 hover:text-muted-foreground"
                >
                  Skip for now →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
