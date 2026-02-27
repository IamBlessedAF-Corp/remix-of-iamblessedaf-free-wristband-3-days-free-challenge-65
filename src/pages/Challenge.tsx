import { useState, useEffect, useMemo, useCallback } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Confetti, KeyUnlockBurst } from "@/components/joy-keys";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Users,
  Heart,
  Sparkles,
  Gift,
  Key,
  Lock,
  Unlock,
  Share2,
  MessageCircle,
  UserPlus,
  Crown,
  Timer,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import UrgencyBanner from "@/components/offer/UrgencyBanner";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useKeyStatus, type KeyNumber } from "@/hooks/useKeyStatus";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMasterKey } from "@/hooks/useMasterKey";
import wristbandsImg from "@/assets/product-wristbands-new.avif";

/* ─────────────────────────────────────────────
   FORM SCHEMA (signup)
   ───────────────────────────────────────────── */
const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
});
type FormValues = z.infer<typeof formSchema>;

/* ─────────────────────────────────────────────
   KEY CONFIG — visual & copy data for each key
   ───────────────────────────────────────────── */
const KEY_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; description: string; reward: string; color: string }
> = {
  "0": {
    label: "Joy Key",
    icon: Key,
    description: "Join the 3-Day Gratitude Challenge",
    reward: "+50 BC",
    color: "from-amber-400 to-yellow-500",
  },
  "1": {
    label: "Wristband Key",
    icon: Share2,
    description: "Share your referral link with someone you love",
    reward: "+100 BC",
    color: "from-emerald-400 to-green-500",
  },
  "2": {
    label: "Commitment Key",
    icon: MessageCircle,
    description: "Share your gratitude story on WhatsApp",
    reward: "+150 BC",
    color: "from-blue-400 to-indigo-500",
  },
  "3": {
    label: "Invite Key",
    icon: UserPlus,
    description: "Invite 3 friends to join the challenge",
    reward: "+200 BC",
    color: "from-purple-400 to-violet-500",
  },
  master: {
    label: "Master Key",
    icon: Crown,
    description: "Unlock FREE shipping on your wristband!",
    reward: "+500 BC",
    color: "from-yellow-400 via-amber-500 to-orange-600",
  },
};

/* ─────────────────────────────────────────────
   HELPER — format timer
   ───────────────────────────────────────────── */
function formatTimer(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENT: KeyCard
   ═══════════════════════════════════════════════ */
interface KeyCardProps {
  keyNum: string;
  isUnlocked: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onAction?: () => void;
  actionLabel?: string;
  actionLoading?: boolean;
}

function KeyCard({ keyNum, isUnlocked, isCurrent, isLocked, onAction, actionLabel, actionLoading }: KeyCardProps) {
  const config = KEY_CONFIG[keyNum];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isCurrent ? { scale: 1.02 } : {}}
      transition={{ delay: Number(keyNum === "master" ? 4 : keyNum) * 0.1 }}
      className={`relative rounded-2xl border-2 p-4 transition-all duration-300 overflow-hidden ${
        isUnlocked
          ? "border-green-400 bg-green-50/80 shadow-lg shadow-green-200/50"
          : isCurrent
          ? "border-amber-400 bg-amber-50/80 shadow-lg shadow-amber-200/50 ring-2 ring-amber-300/50"
          : "border-gray-200 bg-gray-50/50 opacity-60"
      }`}
    >
      {/* Unlock burst effect */}
      <KeyUnlockBurst trigger={isUnlocked} color={isUnlocked ? "#22c55e" : "#f59e0b"} />
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
            isUnlocked ? "from-green-400 to-emerald-500" : isCurrent ? config.color : "from-gray-300 to-gray-400"
          }`}
        >
          {isUnlocked ? (
            <CheckCircle2 className="h-6 w-6 text-white" />
          ) : isLocked ? (
            <Lock className="h-5 w-5 text-white/80" />
          ) : (
            <Icon className="h-6 w-6 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-sm ${isUnlocked ? "text-green-700" : isCurrent ? "text-gray-900" : "text-gray-500"}`}>
              {config.label}
            </h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isUnlocked ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"
            }`}>
              {config.reward}
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isUnlocked ? "text-green-600" : isCurrent ? "text-gray-600" : "text-gray-400"}`}>
            {isUnlocked ? "✓ Completed" : config.description}
          </p>

          {/* Action button for current key */}
          {isCurrent && onAction && !isUnlocked && (
            <Button
              onClick={onAction}
              disabled={actionLoading}
              size="sm"
              className={`mt-2 bg-gradient-to-r ${config.color} text-white border-0 hover:opacity-90 text-xs h-8`}
            >
              {actionLoading ? "..." : actionLabel || "Unlock"}
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENT: SignupState (State 1)
   ═══════════════════════════════════════════════ */
interface SignupStateProps {
  referralCode: string | null;
  isReferred: boolean;
  senderName: string | null;
  onGoogleSignup: () => void;
  googleLoading: boolean;
}

function SignupState({ referralCode, isReferred, senderName, onGoogleSignup, googleLoading }: SignupStateProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    // Store form data + referral for post-OAuth pickup
    sessionStorage.setItem("challenge_name", data.name);
    sessionStorage.setItem("challenge_email", data.email);
    if (referralCode) sessionStorage.setItem("referral_code", referralCode);

    // Fire welcome email
    supabase.functions
      .invoke("send-welcome-email", {
        body: { email: data.email, name: data.name },
      })
      .catch((err) => console.error("Welcome email error:", err));

    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);

    // After form submit, trigger Google sign-in to create auth account
    onGoogleSignup();
  };

  const features = useMemo(() => {
    if (isReferred) {
      return [
        { icon: Gift, text: `${senderName || "A friend"} is sending you a FREE wristband` },
        { icon: Heart, text: "3 days of guided gratitude (5 min/day)" },
        { icon: Sparkles, text: "Earn Blessed Coins & unlock rewards" },
        { icon: Users, text: "Join a community rewiring for joy" },
      ];
    }
    return [
      { icon: Heart, text: "Rewire your brain for gratitude in 3 days" },
      { icon: Sparkles, text: "Earn Blessed Coins & unlock rewards" },
      { icon: Gift, text: "Unlock FREE wristband shipping" },
      { icon: Users, text: "Share joy & grow with friends" },
    ];
  }, [isReferred, senderName]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md mx-auto space-y-6"
    >
      {/* Hero */}
      <div className="text-center space-y-3">
        <motion.img
          src={wristbandsImg}
          alt="Gratitude Wristbands"
          className="w-48 h-auto mx-auto rounded-xl shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
          {isReferred ? (
            <>
              {senderName || "Someone"} Sent You a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">
                FREE Wristband
              </span>{" "}
              🎁
            </>
          ) : (
            <>
              3-Day Gratitude Challenge{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">
                🧠✨
              </span>
            </>
          )}
        </h1>
        <p className="text-sm text-gray-600">
          {isReferred
            ? "Claim your wristband, join the challenge, and start rewiring your brain for joy."
            : "Rewire your brain for joy. Earn rewards. Unlock free shipping."}
        </p>
      </div>

      {/* Features */}
      <div className="space-y-2">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-3 text-sm text-gray-700"
          >
            <f.icon className="h-5 w-5 text-amber-500 shrink-0" />
            <span>{f.text}</span>
          </motion.div>
        ))}
      </div>

      <Separator />

      {/* Google OAuth — primary CTA */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Button
          onClick={onGoogleSignup}
          disabled={googleLoading}
          className="w-full h-12 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-sm font-semibold text-base"
        >
          {googleLoading ? (
            <span className="animate-pulse">Connecting...</span>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </>
          )}
        </Button>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or sign up with email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Email form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Your first name" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="email" placeholder="Your email" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold"
          >
            {isSubmitting ? "Joining..." : isReferred ? "Claim My FREE Wristband 🎁" : "Start the Challenge ✨"}
          </Button>
        </form>
      </Form>

      <p className="text-[10px] text-center text-gray-400 leading-tight">
        By joining, you agree to our Terms of Service. We'll never spam you.
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENT: ActivatingState (State 2)
   Brief transition while key0 auto-activates
   ═══════════════════════════════════════════════ */
function ActivatingState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto flex flex-col items-center justify-center py-20 space-y-6"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg"
      >
        <Key className="h-8 w-8 text-white" />
      </motion.div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-900">Activating Your Joy Key...</h2>
        <p className="text-sm text-gray-500">Setting up your gratitude challenge</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENT: KeyDashboard (State 3)
   Shows all key progress + actions
   ═══════════════════════════════════════════════ */
interface KeyDashboardProps {
  keyStatus: ReturnType<typeof useKeyStatus>;
  masterKey: ReturnType<typeof useMasterKey>;
  analytics: ReturnType<typeof useAnalytics>;
  senderName: string | null;
  referralCode: string | null;
}

function KeyDashboard({ keyStatus, masterKey, analytics, senderName, referralCode }: KeyDashboardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [key1Loading, setKey1Loading] = useState(false);
  const { status, currentKey, timerMs, hasMasterKey, hasShippingCredit, friendsNeeded, isKeyUnlocked, unlockKey1, sendInvite } =
    keyStatus;

  // Build share URL from user's referral code (fetched from creator_profiles)
  const [myReferralCode, setMyReferralCode] = useState<string | null>(null);
  useEffect(() => {
    if (!keyStatus.userId) return;
    const fetchCode = async () => {
      const { data } = await supabase
        .from("creator_profiles" as any)
        .select("referral_code")
        .eq("user_id", keyStatus.userId)
        .maybeSingle();
      if ((data as any)?.referral_code) setMyReferralCode((data as any).referral_code);
    };
    fetchCode();
  }, [keyStatus.userId]);

  const shareUrl = myReferralCode ? `https://iamblessedaf.com/challenge?ref=${myReferralCode}` : "";

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      analytics.trackShare("copy_link", "clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  }, [shareUrl, analytics]);

  const handleKey1Action = useCallback(async () => {
    setKey1Loading(true);
    // Mark key1 as shared (user copied/shared their link)
    const ok = await unlockKey1(null, "share_link", "web");
    if (ok) analytics.track("key1_unlocked", { method: "share_link" });
    setKey1Loading(false);
  }, [unlockKey1, analytics]);

  // Navigate to story template for key 2
  const handleKey2Action = useCallback(() => {
    navigate("/challenge/story");
    analytics.track("key2_action_clicked");
  }, [navigate, analytics]);

  // Navigate to invite page for key 3
  const handleKey3Action = useCallback(() => {
    navigate("/challenge/invite");
    analytics.track("key3_action_clicked");
  }, [navigate, analytics]);

  // Check master key when all keys might be done
  useEffect(() => {
    if (status && status.key0_at && status.key1_at && status.key2_at && status.key3_at && !status.master_key_at) {
      masterKey.checkMasterKey(keyStatus.userId!);
    }
  }, [status, keyStatus.userId, masterKey]);

  // Master key celebration
  const showCelebration = masterKey.result?.unlocked && !masterKey.celebrated;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md mx-auto space-y-5"
    >
      {/* Confetti canvas behind celebration */}
      <Confetti active={!!showCelebration} duration={4000} particleCount={100} />

      {/* Master Key Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => masterKey.markCelebrated()}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="bg-white rounded-3xl p-8 mx-4 text-center shadow-2xl max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-6xl mb-4"
              >
                👑
              </motion.div>
              <h2 className="text-2xl font-extrabold text-gray-900">MASTER KEY UNLOCKED!</h2>
              <p className="text-sm text-gray-600 mt-2">You earned FREE shipping + {masterKey.result?.bc_awarded} Blessed Coins!</p>
              <Button
                onClick={() => {
                  masterKey.markCelebrated();
                  navigate("/offer/wristband");
                }}
                className="mt-4 w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold"
              >
                Claim My FREE Wristband 🎁
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer header */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-extrabold text-gray-900">Your Gratitude Challenge</h1>
        {timerMs > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Timer className="h-4 w-4" />
            <span className="font-mono font-semibold text-amber-600">{formatTimer(timerMs)}</span>
            <span>remaining</span>
          </div>
        )}
      </div>

      {/* Share link card (always visible after key0) */}
      {shareUrl && (
        <div className="rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-3">
          <p className="text-xs font-semibold text-amber-700 mb-2">📎 Your Referral Link</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 text-gray-700 truncate"
            />
            <Button
              onClick={handleCopyLink}
              size="sm"
              variant="outline"
              className="shrink-0 border-amber-300 text-amber-700 h-9"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Key Progress Cards */}
      <div className="space-y-3">
        <KeyCard
          keyNum="0"
          isUnlocked={isKeyUnlocked(0)}
          isCurrent={currentKey === 0}
          isLocked={false}
        />
        <KeyCard
          keyNum="1"
          isUnlocked={isKeyUnlocked(1)}
          isCurrent={currentKey === 0 && isKeyUnlocked(0)}
          isLocked={!isKeyUnlocked(0)}
          onAction={handleKey1Action}
          actionLabel="I Shared My Link"
          actionLoading={key1Loading}
        />
        <KeyCard
          keyNum="2"
          isUnlocked={isKeyUnlocked(2)}
          isCurrent={isKeyUnlocked(1) && !isKeyUnlocked(2)}
          isLocked={!isKeyUnlocked(1)}
          onAction={handleKey2Action}
          actionLabel="Share My Story"
        />
        <KeyCard
          keyNum="3"
          isUnlocked={isKeyUnlocked(3)}
          isCurrent={isKeyUnlocked(2) && !isKeyUnlocked(3)}
          isLocked={!isKeyUnlocked(2)}
          onAction={handleKey3Action}
          actionLabel={`Invite Friends (${3 - (friendsNeeded ?? 3)}/3)`}
        />

        {/* Master Key */}
        <div className="pt-2">
          <KeyCard
            keyNum="master"
            isUnlocked={hasMasterKey}
            isCurrent={isKeyUnlocked(3) && !hasMasterKey}
            isLocked={!isKeyUnlocked(3)}
            onAction={hasMasterKey ? undefined : () => navigate("/offer/wristband")}
            actionLabel={hasShippingCredit ? "Get FREE Shipping" : "Claim Wristband"}
          />
        </div>
      </div>

      {/* CTA to wristband offer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <Button
          onClick={() => navigate("/offer/wristband")}
          className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold text-base"
        >
          {hasMasterKey ? "Get Your FREE Wristband 🎁" : "Get Your Wristband Now →"}
        </Button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT: Challenge
   3-state router: signup → activating → dashboard
   ═══════════════════════════════════════════════ */
const Challenge = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [senderName, setSenderName] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const { signInWithGoogle, user } = useAuth();
  const keyStatus = useKeyStatus();
  const analytics = useAnalytics();
  const masterKeyHook = useMasterKey();

  const referralCode = searchParams.get("ref");
  const isReferred = !!referralCode;

  usePageMeta({
    title: senderName
      ? `${senderName} Sent You a FREE Gratitude Wristband 🎁`
      : "3-Day Gratitude Challenge | Win $1,111 | I am Blessed AF",
    description: senderName
      ? `${senderName} wants to share gratitude with you. Claim your FREE wristband and join the 3-Day Gratitude Challenge.`
      : "Join the 3-Day Gratitude Challenge. Rewire your brain for joy, earn rewards, and win $1,111. Backed by neuroscience.",
    image: "/og-image.png",
    url: "https://iamblessedaf.com/challenge",
  });

  // Look up sender name from referral code
  useEffect(() => {
    if (!referralCode) return;
    const lookupSender = async () => {
      try {
        const { data } = await supabase
          .from("creator_profiles_public")
          .select("display_name")
          .eq("referral_code", referralCode)
          .maybeSingle();
        if (data?.display_name) {
          setSenderName(data.display_name.split(" ")[0]);
        }
      } catch {}
    };
    lookupSender();
  }, [referralCode]);

  // Track page view
  useEffect(() => {
    analytics.trackPageView("challenge", { referral_code: referralCode ?? undefined, is_referred: isReferred });
  }, [analytics, referralCode, isReferred]);

  // Auto-activate key0 when user is authenticated but has no key0 yet
  useEffect(() => {
    if (!user || !keyStatus.isAuthenticated || keyStatus.loading) return;
    if (keyStatus.status === null && !activating) {
      // No keys_status row yet — activate key0
      setActivating(true);
      keyStatus.activateKey0().then((ok) => {
        if (ok) {
          analytics.track("key0_activated", { referral_code: referralCode ?? undefined });
        }
        // Small delay for the animation to be visible
        setTimeout(() => setActivating(false), 1500);
      });
    }
  }, [user, keyStatus.isAuthenticated, keyStatus.loading, keyStatus.status, activating, keyStatus, analytics, referralCode]);

  // Google OAuth handler with referral persistence
  const handleGoogleSignup = useCallback(async () => {
    setGoogleLoading(true);
    if (referralCode) sessionStorage.setItem("referral_code", referralCode);
    const { error } = await signInWithGoogle();
    if (error) {
      console.error("Google sign-in error:", error);
      setGoogleLoading(false);
    }
  }, [referralCode, signInWithGoogle]);

  /* ─── STATE ROUTING ─── */

  // Loading
  if (keyStatus.loading && user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="I am Blessed AF" className="h-10" />
          </div>
          <ActivatingState />
        </div>
      </div>
    );
  }

  // Activating key0 (brief transition)
  if (activating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="I am Blessed AF" className="h-10" />
          </div>
          <ActivatingState />
        </div>
      </div>
    );
  }

  // Determine which state to render
  const isAuthenticated = !!user;
  const hasKey0 = keyStatus.status?.key0_at != null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50/30">
      <UrgencyBanner />
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="I am Blessed AF" className="h-10" />
        </div>

        <GamificationHeader />

        <AnimatePresence mode="wait" initial={false}>
          {!isAuthenticated ? (
            /* STATE 1: Signup */
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SignupState
                referralCode={referralCode}
                isReferred={isReferred}
                senderName={senderName}
                onGoogleSignup={handleGoogleSignup}
                googleLoading={googleLoading}
              />
            </motion.div>
          ) : hasKey0 ? (
            /* STATE 3: Key Dashboard */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <KeyDashboard
                keyStatus={keyStatus}
                masterKey={masterKeyHook}
                analytics={analytics}
                senderName={senderName}
                referralCode={referralCode}
              />
            </motion.div>
          ) : (
            /* STATE 2: Should auto-activate — fallback UI */
            <motion.div
              key="activating"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ActivatingState />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Challenge;
