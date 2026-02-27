import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Send,
  Check,
  Clock,
  X,
  Copy,
  Share2,
  MessageCircle,
  Mail,
  ArrowLeft,
  Crown,
  Sparkles,
  Gift,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useKeyStatus, type ChallengeFriend } from "@/hooks/useKeyStatus";
import { useMasterKey } from "@/hooks/useMasterKey";
import { useAnalytics } from "@/hooks/useAnalytics";

// ═══════════════════════════════════════════════════════════════
// Master Key Celebration Overlay
// ═══════════════════════════════════════════════════════════════
function MasterKeyCelebration({
  bcAwarded,
  onDismiss,
}: {
  bcAwarded: number;
  onDismiss: () => void;
}) {
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      size: 4 + Math.random() * 8,
      color: [
        "#FFD700",
        "#FFA500",
        "#FF6347",
        "#9333EA",
        "#3B82F6",
        "#10B981",
      ][Math.floor(Math.random() * 6)],
    }))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onDismiss}
    >
      {/* Confetti particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{
            y: "110vh",
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "linear",
          }}
          className="absolute top-0 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: `${p.x}%`,
          }}
        />
      ))}

      {/* Center card */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15, delay: 0.3 }}
        className="relative z-10 mx-4 max-w-sm w-full rounded-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Golden gradient background */}
        <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 p-[2px] rounded-3xl">
          <div className="bg-zinc-950 rounded-3xl p-8 text-center space-y-6">
            {/* Crown icon */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", delay: 0.6 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Crown className="w-10 h-10 text-zinc-950" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-2"
            >
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                MASTER KEY
              </h2>
              <p className="text-xl font-bold text-white">UNLOCKED! 🔓</p>
            </motion.div>

            {/* Rewards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <Sparkles className="w-5 h-5" />
                <span className="text-lg font-bold">+{bcAwarded} BC Earned</span>
                <Sparkles className="w-5 h-5" />
              </div>

              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <Gift className="w-5 h-5" />
                <span className="text-lg font-semibold">FREE Shipping Unlocked</span>
              </div>
            </motion.div>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-zinc-400 text-sm leading-relaxed"
            >
              You've completed all 4 Joy Keys! Your Neuro-Hacker Wristband
              ships <span className="text-white font-semibold">FREE</span>.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
            >
              <Button
                onClick={onDismiss}
                className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-zinc-950 font-bold text-lg h-14 rounded-xl shadow-lg shadow-amber-500/20"
              >
                <Crown className="w-5 h-5 mr-2" />
                Claim My FREE Wristband
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Friend Card
// ═══════════════════════════════════════════════════════════════
function FriendCard({ friend }: { friend: ChallengeFriend }) {
  const statusConfig = {
    invited: { icon: Clock, color: "text-zinc-400", bg: "bg-zinc-800", label: "Invited" },
    clicked: { icon: Clock, color: "text-amber-400", bg: "bg-amber-950/40", label: "Clicked" },
    joined: { icon: Check, color: "text-emerald-400", bg: "bg-emerald-950/40", label: "Joined!" },
    expired: { icon: X, color: "text-red-400", bg: "bg-red-950/40", label: "Expired" },
  };

  const cfg = statusConfig[friend.status] || statusConfig.invited;
  const StatusIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 rounded-xl ${cfg.bg} border border-zinc-800/50`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          friend.status === "joined"
            ? "bg-emerald-500/20"
            : "bg-zinc-700/50"
        }`}
      >
        <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {friend.friend_name || "Friend"}
        </p>
        <p className={`text-xs ${cfg.color}`}>{cfg.label}</p>
      </div>

      {friend.status === "joined" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-emerald-400"
        >
          <Star className="w-5 h-5 fill-emerald-400" />
        </motion.div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Invite Form
// ═══════════════════════════════════════════════════════════════
function InviteForm({
  onSend,
  sending,
}: {
  onSend: (name: string, contact: string, method: string) => void;
  sending: boolean;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [method, setMethod] = useState<"whatsapp" | "sms" | "email" | "link">("link");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSend(name.trim(), contact.trim(), method);
    setName("");
    setContact("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <Input
          placeholder="Friend's name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-xl"
          required
        />
        <Input
          placeholder={
            method === "email"
              ? "Email address"
              : method === "link"
              ? "Phone or email (optional)"
              : "Phone number"
          }
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 h-12 rounded-xl"
        />
      </div>

      {/* Method selector */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { key: "link" as const, icon: Copy, label: "Link" },
          { key: "whatsapp" as const, icon: MessageCircle, label: "WhatsApp" },
          { key: "sms" as const, icon: Send, label: "SMS" },
          { key: "email" as const, icon: Mail, label: "Email" },
        ].map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMethod(m.key)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all ${
              method === m.key
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "bg-zinc-800/50 text-zinc-500 border border-zinc-800"
            }`}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
          </button>
        ))}
      </div>

      <Button
        type="submit"
        disabled={!name.trim() || sending}
        className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-purple-500/20"
      >
        {sending ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Send className="w-5 h-5" />
          </motion.div>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Send Invite
          </>
        )}
      </Button>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════
// Share Link Card
// ═══════════════════════════════════════════════════════════════
function ShareLinkCard({ inviteCode }: { inviteCode: string | null }) {
  const { toast } = useToast();
  const shareUrl = inviteCode
    ? `${window.location.origin}/r/${inviteCode}`
    : null;

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied!", description: "Share it with your friends 🔥" });
    } catch {
      toast({ title: "Copy failed", description: "Try again", variant: "destructive" });
    }
  }, [shareUrl, toast]);

  const shareNative = useCallback(async () => {
    if (!shareUrl || !navigator.share) return;
    try {
      await navigator.share({
        title: "IamBlessedAF — Free Neuro-Hacker Wristband",
        text: "Join me on this journey! Get a FREE wristband 🔥",
        url: shareUrl,
      });
    } catch {
      // User cancelled — no action needed
    }
  }, [shareUrl]);

  if (!shareUrl) return null;

  return (
    <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-3">
      <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
        Your invite link
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 truncate font-mono">
          {shareUrl}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={copyLink}
          className="border-zinc-700 h-10 w-10 shrink-0"
        >
          <Copy className="w-4 h-4" />
        </Button>
        {typeof navigator.share === "function" && (
          <Button
            variant="outline"
            size="icon"
            onClick={shareNative}
            className="border-zinc-700 h-10 w-10 shrink-0"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════
export default function ChallengeInvite() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { track, trackShare } = useAnalytics();

  const {
    status,
    friends,
    invites,
    loading,
    isAuthenticated,
    userId,
    friendsNeeded,
    hasMasterKey,
    isKeyUnlocked,
    sendInvite,
    refetch,
  } = useKeyStatus();

  const {
    checkMasterKey,
    result: masterResult,
    celebrated,
    markCelebrated,
    areAllKeysComplete,
  } = useMasterKey();

  const [sending, setSending] = useState(false);
  const [lastInviteCode, setLastInviteCode] = useState<string | null>(null);

  // Track page view
  useEffect(() => {
    track("page_view", { page: "challenge_invite" });
  }, [track]);

  // Auth guard
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/challenge");
    }
  }, [loading, isAuthenticated, navigate]);

  // Check master key when key3 completes
  useEffect(() => {
    if (userId && status && areAllKeysComplete(status)) {
      checkMasterKey(userId);
    }
  }, [userId, status, areAllKeysComplete, checkMasterKey]);

  // Get latest invite code from invites list
  useEffect(() => {
    if (invites.length > 0 && !lastInviteCode) {
      setLastInviteCode(invites[0].code);
    }
  }, [invites, lastInviteCode]);

  // Handle invite send
  const handleSendInvite = useCallback(
    async (name: string, contact: string, method: string) => {
      setSending(true);

      const phone = method === "sms" || method === "whatsapp" ? contact : "";
      const email = method === "email" ? contact : "";

      const result = await sendInvite(name, phone, email, method);

      if (result.success) {
        toast({
          title: "Invite sent! 🎉",
          description: `${name} has been invited`,
        });

        if (result.inviteCode) {
          setLastInviteCode(result.inviteCode);

          // Auto-share via WhatsApp
          if (method === "whatsapp" && contact) {
            const shareUrl = `${window.location.origin}/r/${result.inviteCode}`;
            const whatsappUrl = `https://wa.me/${contact.replace(/\D/g, "")}?text=${encodeURIComponent(
              `Hey ${name}! 🔥 Join me — get a FREE Neuro-Hacker Wristband: ${shareUrl}`
            )}`;
            window.open(whatsappUrl, "_blank");
          }
        }

        trackShare("invite", method);
        track("key3_invite_sent", { method, friend_name: name });
      } else {
        toast({
          title: "Invite failed",
          description: "Please try again",
          variant: "destructive",
        });
      }

      setSending(false);
    },
    [sendInvite, toast, trackShare, track]
  );

  // Handle celebration dismiss
  const handleCelebrationDismiss = useCallback(() => {
    markCelebrated();
    navigate("/offer/wristband");
  }, [markCelebrated, navigate]);

  // ── Derived state ──
  const acceptedCount = friends.filter((f) => f.status === "joined").length;
  const pendingCount = friends.filter(
    (f) => f.status === "invited" || f.status === "clicked"
  ).length;
  const progressPct = Math.min(100, (acceptedCount / 3) * 100);
  const key3Done = isKeyUnlocked(3);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <UserPlus className="w-6 h-6 text-purple-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Master Key Celebration */}
      <AnimatePresence>
        {masterResult?.unlocked && !celebrated && (
          <MasterKeyCelebration
            bcAwarded={masterResult.bc_awarded}
            onDismiss={handleCelebrationDismiss}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/keys")}
            className="p-2 -ml-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Invite Key</h1>
            <p className="text-xs text-zinc-500">
              {key3Done ? "Key 3 Complete ✓" : `${acceptedCount}/3 friends joined`}
            </p>
          </div>
          {key3Done && (
            <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
              +200 BC
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Progress ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#27272a"
                strokeWidth="8"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#purpleGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 52 * (1 - progressPct / 100),
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">
                {acceptedCount}/3
              </span>
              <span className="text-xs text-zinc-500">Friends joined</span>
            </div>
          </div>

          {key3Done ? (
            <p className="text-emerald-400 font-bold text-center">
              🎉 Key 3 complete! {hasMasterKey ? "Master Key unlocked!" : ""}
            </p>
          ) : (
            <p className="text-zinc-400 text-sm text-center max-w-xs">
              Invite 3 friends to join the challenge. When they sign up, you
              both earn <span className="text-purple-400 font-bold">Blessed Coins</span>.
            </p>
          )}
        </motion.div>

        {/* Friends list */}
        {friends.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                Your invites
              </h3>
              <span className="text-xs text-zinc-600">
                {pendingCount} pending · {acceptedCount} joined
              </span>
            </div>
            <div className="space-y-2">
              {friends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Share link */}
        <ShareLinkCard inviteCode={lastInviteCode} />

        {/* Invite form — only show if not done */}
        {!key3Done && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Invite a friend
            </h3>
            <InviteForm onSend={handleSendInvite} sending={sending} />
          </motion.div>
        )}

        {/* Master Key CTA */}
        {key3Done && !hasMasterKey && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-amber-500/20 text-center space-y-4"
          >
            <Crown className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-xl font-bold text-amber-300">
              All Keys Complete!
            </h3>
            <p className="text-sm text-zinc-400">
              You're ready to unlock your Master Key and get FREE shipping.
            </p>
            <Button
              onClick={() => userId && checkMasterKey(userId)}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-zinc-950 font-bold h-12 rounded-xl"
            >
              <Crown className="w-5 h-5 mr-2" />
              Unlock Master Key
            </Button>
          </motion.div>
        )}

        {/* Already has master key */}
        {hasMasterKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Button
              onClick={() => navigate("/offer/wristband")}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-zinc-950 font-bold h-14 rounded-xl shadow-lg shadow-amber-500/20"
            >
              <Gift className="w-5 h-5 mr-2" />
              Claim FREE Wristband
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
