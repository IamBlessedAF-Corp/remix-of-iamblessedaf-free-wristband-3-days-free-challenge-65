/**
 * /keys — Joy Keys Progress Dashboard
 * Dedicated full-page dashboard showing detailed key progress,
 * friend tracking, BC rewards, timeline, and next actions.
 *
 * Sprint 4 — IamBlessedAF Joy Keys Engine
 */

import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key, Share2, MessageCircle, UserPlus, Crown,
  ChevronRight, Copy, Check, Gift, Sparkles,
  ArrowLeft, Clock, Users, Coins, Shield,
  ExternalLink, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useKeyStatus } from "@/hooks/useKeyStatus";
import { useAnalytics } from "@/hooks/useAnalytics";
import { KeyUnlockGlow, ProgressRing } from "@/components/joy-keys";
import { useMasterKey } from "@/hooks/useMasterKey";

/* ═══════════════════════════════════════════════
   KEY CONFIGURATION
   ═══════════════════════════════════════════════ */

interface KeyMeta {
  num: 0 | 1 | 2 | 3 | "master";
  label: string;
  icon: React.ElementType;
  description: string;
  howTo: string;
  reward: number;
  color: string;
  gradient: string;
  actionLabel: string;
  actionRoute: string;
}

const KEYS: KeyMeta[] = [
  {
    num: 0,
    label: "Joy Key",
    icon: Key,
    description: "Join the 3-Day Gratitude Challenge",
    howTo: "Sign up and your Joy Key activates automatically — you're already in!",
    reward: 50,
    color: "text-amber-400",
    gradient: "from-amber-400 to-yellow-500",
    actionLabel: "Already Activated",
    actionRoute: "/challenge",
  },
  {
    num: 1,
    label: "Wristband Key",
    icon: Share2,
    description: "Share your referral link with someone you love",
    howTo: "Copy your personal referral link and share it. When someone signs up through your link, this key unlocks!",
    reward: 100,
    color: "text-emerald-400",
    gradient: "from-emerald-400 to-green-500",
    actionLabel: "Share Referral Link",
    actionRoute: "/challenge",
  },
  {
    num: 2,
    label: "Commitment Key",
    icon: MessageCircle,
    description: "Share your gratitude story on WhatsApp",
    howTo: "Create a quick gratitude story image and share it to your WhatsApp status or group. Screenshot the proof!",
    reward: 150,
    color: "text-blue-400",
    gradient: "from-blue-400 to-indigo-500",
    actionLabel: "Create & Share Story",
    actionRoute: "/challenge/story",
  },
  {
    num: 3,
    label: "Invite Key",
    icon: UserPlus,
    description: "Invite 3 friends to join the challenge",
    howTo: "Send personal invites to 3 friends. When all 3 accept and join the challenge, your Invite Key unlocks!",
    reward: 200,
    color: "text-purple-400",
    gradient: "from-purple-400 to-violet-500",
    actionLabel: "Invite Friends",
    actionRoute: "/challenge/invite",
  },
  {
    num: "master",
    label: "Master Key",
    icon: Crown,
    description: "Unlock FREE shipping on your wristband!",
    howTo: "Complete all 4 keys above. The Master Key unlocks automatically and you earn FREE shipping + 500 Blessed Coins!",
    reward: 500,
    color: "text-yellow-400",
    gradient: "from-yellow-400 via-amber-500 to-orange-600",
    actionLabel: "Claim Wristband",
    actionRoute: "/offer/wristband",
  },
];

const TOTAL_BC = KEYS.reduce((sum, k) => sum + k.reward, 0); // 1000 BC total

/* ═══════════════════════════════════════════════
   HELPER: format relative time
   ═══════════════════════════════════════════════ */

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENT: Expanded Key Card
   ═══════════════════════════════════════════════ */

interface ExpandedKeyCardProps {
  meta: KeyMeta;
  isUnlocked: boolean;
  isActive: boolean; // current key to work on
  unlockedAt: string | null;
  onAction: () => void;
}

const ExpandedKeyCard = ({ meta, isUnlocked, isActive, unlockedAt, onAction }: ExpandedKeyCardProps) => {
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: typeof meta.num === "number" ? meta.num * 0.1 : 0.4 }}
    >
      <KeyUnlockGlow unlocked={isUnlocked} color={isUnlocked ? "#22c55e" : "#f59e0b"}>
      <Card
        className={`relative overflow-hidden border transition-all duration-300 ${
          isUnlocked
            ? "border-green-500/30 bg-green-950/20"
            : isActive
            ? "border-white/20 bg-white/5 ring-1 ring-white/10"
            : "border-white/5 bg-white/[0.02] opacity-60"
        }`}
      >
        {/* Gradient accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.gradient} ${
          isUnlocked ? "opacity-100" : isActive ? "opacity-60" : "opacity-20"
        }`} />

        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              isUnlocked
                ? `bg-gradient-to-br ${meta.gradient} shadow-lg`
                : isActive
                ? "bg-white/10 border border-white/20"
                : "bg-white/5 border border-white/10"
            }`}>
              {isUnlocked ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <Icon className={`w-6 h-6 ${isActive ? meta.color : "text-white/30"}`} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-lg">{meta.label}</h3>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    isUnlocked
                      ? "border-green-500/50 text-green-400 bg-green-500/10"
                      : isActive
                      ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                      : "border-white/10 text-white/30"
                  }`}
                >
                  {isUnlocked ? "✓ Unlocked" : isActive ? "Next Up" : "Locked"}
                </Badge>
                <span className={`text-sm font-semibold ${isUnlocked ? "text-green-400" : meta.color}`}>
                  +{meta.reward} BC
                </span>
              </div>

              <p className="text-white/60 text-sm mt-1">{meta.description}</p>

              {/* How-to section */}
              {(isActive || isUnlocked) && (
                <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">
                    How it works
                  </p>
                  <p className="text-sm text-white/70">{meta.howTo}</p>
                </div>
              )}

              {/* Timestamp */}
              {isUnlocked && unlockedAt && (
                <p className="text-xs text-white/30 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Unlocked {formatDate(unlockedAt)} ({timeAgo(unlockedAt)})
                </p>
              )}

              {/* Action button */}
              {isActive && !isUnlocked && (
                <Button
                  onClick={onAction}
                  className={`mt-4 bg-gradient-to-r ${meta.gradient} text-white font-semibold hover:opacity-90 transition-opacity`}
                  size="sm"
                >
                  {meta.actionLabel}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      </KeyUnlockGlow>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   SUB-COMPONENT: Friends Tracker (Key 3)
   ═══════════════════════════════════════════════ */

interface FriendsTrackerProps {
  friends: Array<{ id: string; friend_name: string | null; friend_email: string | null; joined_at: string | null; status: string }>;
  friendsNeeded: number;
}

const FriendsTracker = ({ friends, friendsNeeded }: FriendsTrackerProps) => {
  const accepted = friends.filter((f) => f.status === "accepted");
  const pending = friends.filter((f) => f.status === "pending");
  const progress = Math.min((accepted.length / 3) * 100, 100);

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Invite Tracker
          <Badge variant="outline" className="ml-auto border-purple-500/30 text-purple-400 text-xs">
            {accepted.length}/3 joined
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2 bg-white/10" />

        {accepted.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Joined</p>
            {accepted.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {f.friend_name || f.friend_email || "Friend"}
                  </p>
                  {f.joined_at && (
                    <p className="text-xs text-white/30">{timeAgo(f.joined_at)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {pending.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Pending</p>
            {pending.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white/40" />
                </div>
                <p className="text-sm text-white/50 truncate">
                  {f.friend_name || f.friend_email || "Invited friend"}
                </p>
              </div>
            ))}
          </div>
        )}

        {friendsNeeded > 0 && (
          <p className="text-center text-sm text-white/40">
            {friendsNeeded} more friend{friendsNeeded > 1 ? "s" : ""} needed to unlock Key 3
          </p>
        )}
      </CardContent>
    </Card>
  );
};

/* ═══════════════════════════════════════════════
   SUB-COMPONENT: Referral Link Card
   ═══════════════════════════════════════════════ */

const ReferralCard = ({ referralCode }: { referralCode: string | null }) => {
  const { toast } = useToast();

  if (!referralCode) return null;

  const link = `https://iamblessedaf.com/challenge?ref=${referralCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Link copied! 🔗", description: "Share it with someone you love" });
    } catch {
      toast({ title: "Couldn't copy", description: "Long-press the link to copy manually", variant: "destructive" });
    }
  };

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Share2 className="w-5 h-5 text-emerald-400" />
          <p className="text-white font-semibold text-sm">Your Referral Link</p>
        </div>
        <div
          onClick={copyLink}
          className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <p className="text-white/70 text-xs flex-1 truncate font-mono">{link}</p>
          <Copy className="w-4 h-4 text-white/40 flex-shrink-0" />
        </div>
        <p className="text-xs text-white/30 mt-2 text-center">
          Tap to copy • Each friend who joins = you level up
        </p>
      </CardContent>
    </Card>
  );
};

/* ═══════════════════════════════════════════════
   SUB-COMPONENT: BC Rewards Summary
   ═══════════════════════════════════════════════ */

interface RewardsSummaryProps {
  earnedBC: number;
  totalBC: number;
  keysUnlocked: number;
  totalKeys: number;
}

const RewardsSummary = ({ earnedBC, totalBC, keysUnlocked, totalKeys }: RewardsSummaryProps) => (
  <div className="grid grid-cols-2 gap-3">
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="p-4 text-center">
        <Coins className="w-6 h-6 text-amber-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-white">{earnedBC}</p>
        <p className="text-xs text-white/40">of {totalBC} BC earned</p>
        <Progress value={(earnedBC / totalBC) * 100} className="h-1.5 mt-2 bg-white/10" />
      </CardContent>
    </Card>
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="p-4 text-center">
        <Key className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-white">{keysUnlocked}</p>
        <p className="text-xs text-white/40">of {totalKeys} keys unlocked</p>
        <Progress value={(keysUnlocked / totalKeys) * 100} className="h-1.5 mt-2 bg-white/10" />
      </CardContent>
    </Card>
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════ */

const Keys = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const keyStatus = useKeyStatus();
  const analytics = useAnalytics();
  const masterKey = useMasterKey();

  const { status, friends, loading, isAuthenticated, currentKey, hasMasterKey, hasShippingCredit, friendsNeeded, isKeyUnlocked } = keyStatus;

  // Track page view
  useEffect(() => {
    analytics.trackPageView("/keys");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to challenge if not authenticated or no key0
  useEffect(() => {
    if (!loading && (!isAuthenticated || !status?.key0_at)) {
      navigate("/challenge", { replace: true });
    }
  }, [loading, isAuthenticated, status, navigate]);

  // Compute earned BC and unlocked count
  const { earnedBC, keysUnlocked } = useMemo(() => {
    if (!status) return { earnedBC: 0, keysUnlocked: 0 };
    let bc = 0;
    let count = 0;
    if (status.key0_at) { bc += 50; count++; }
    if (status.key1_at) { bc += 100; count++; }
    if (status.key2_at) { bc += 150; count++; }
    if (status.key3_at) { bc += 200; count++; }
    if (status.master_key_at) { bc += 500; count++; }
    return { earnedBC: bc, keysUnlocked: count };
  }, [status]);

  // Map key number to unlocked timestamp
  const getUnlockedAt = (num: 0 | 1 | 2 | 3 | "master"): string | null => {
    if (!status) return null;
    switch (num) {
      case 0: return status.key0_at;
      case 1: return status.key1_at;
      case 2: return status.key2_at;
      case 3: return status.key3_at;
      case "master": return status.master_key_at;
    }
  };

  // Determine which key is "active" (the next one to unlock)
  const activeKeyNum = useMemo(() => {
    if (!status) return 0;
    if (!status.key0_at) return 0;
    if (!status.key1_at) return 1;
    if (!status.key2_at) return 2;
    if (!status.key3_at) return 3;
    if (!status.master_key_at) return "master" as const;
    return null; // all done
  }, [status]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  // Referral code from status
  const referralCode = (status as any)?.referral_code || null;

  // Overall progress percentage
  const progressPercent = (keysUnlocked / 5) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ─── Header ─── */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/challenge")}
            className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Joy Keys</h1>
            <p className="text-xs text-white/40">Your progress dashboard</p>
          </div>
          {hasMasterKey && (
            <Badge className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-white border-0 text-xs">
              <Crown className="w-3 h-3 mr-1" /> Master
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
        {/* ─── Overall Progress ─── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider font-medium">Overall Progress</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {keysUnlocked}<span className="text-white/30 text-lg">/5</span>
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  hasMasterKey
                    ? "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600"
                    : "bg-white/10"
                }`}>
                  {hasMasterKey ? (
                    <Crown className="w-8 h-8 text-white" />
                  ) : (
                    <Sparkles className="w-8 h-8 text-white/30" />
                  )}
                </div>
              </div>
              <Progress value={progressPercent} className="h-2.5 bg-white/10" />
              <p className="text-xs text-white/30 mt-2">
                {hasMasterKey
                  ? "🎉 All keys unlocked! You earned FREE shipping!"
                  : `${5 - keysUnlocked} more key${5 - keysUnlocked > 1 ? "s" : ""} to unlock your Master Key`
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── BC Rewards Summary ─── */}
        <RewardsSummary
          earnedBC={earnedBC}
          totalBC={TOTAL_BC}
          keysUnlocked={keysUnlocked}
          totalKeys={5}
        />

        {/* ─── Referral Link ─── */}
        <ReferralCard referralCode={referralCode} />

        {/* ─── Key Cards ─── */}
        <div className="space-y-3">
          <h2 className="text-white/60 text-xs uppercase tracking-wider font-medium px-1">
            Your Keys
          </h2>
          {KEYS.map((meta) => (
            <ExpandedKeyCard
              key={String(meta.num)}
              meta={meta}
              isUnlocked={isKeyUnlocked(meta.num)}
              isActive={activeKeyNum === meta.num}
              unlockedAt={getUnlockedAt(meta.num)}
              onAction={() => {
                analytics.track("key_action_clicked", { key: meta.num });
                navigate(meta.actionRoute);
              }}
            />
          ))}
        </div>

        {/* ─── Friends Tracker (always show if key3 data exists or it's active) ─── */}
        {(activeKeyNum === 3 || isKeyUnlocked(3) || friends.length > 0) && (
          <FriendsTracker friends={friends} friendsNeeded={friendsNeeded} />
        )}

        {/* ─── Master Key CTA ─── */}
        {hasMasterKey && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 overflow-hidden">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {hasShippingCredit ? "FREE Shipping Unlocked!" : "Master Key Complete!"}
                  </h3>
                  <p className="text-white/60 text-sm mt-1">
                    {hasShippingCredit
                      ? "Claim your NeuroHacker Wristband with free shipping"
                      : "You've completed all Joy Keys — amazing dedication!"
                    }
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/offer/wristband")}
                  className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-white font-bold text-lg py-6 hover:opacity-90"
                  size="lg"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Claim Your Wristband
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Shipping Credit Badge ─── */}
        {hasShippingCredit && (
          <div className="flex items-center justify-center gap-2 text-xs text-green-400/80">
            <Shield className="w-4 h-4" />
            <span>Free shipping credit active on your account</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Keys;
