import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Mail, MessageSquare, Share2, Copy, Loader2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import InviteFriendsModal from "@/components/portal/InviteFriendsModal";
import logo from "@/assets/logo.png";

// Social media icons
const TikTokIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const ChallengeThanks = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Check if this user arrived via a referral (wristband gift flow)
  const incomingRef = searchParams.get("ref") || sessionStorage.getItem("referral_code");
  const isReferred = !!incomingRef;

  // Clear sessionStorage referral after reading it
  useEffect(() => {
    if (sessionStorage.getItem("referral_code")) {
      sessionStorage.removeItem("referral_code");
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (loading) return;

      if (!user) {
        // Redirect unauthenticated users back to challenge
        navigate("/challenge");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("creator_profiles")
          .select("referral_code, display_name, congrats_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error && import.meta.env.DEV) {
          console.error("Error fetching profile:", error);
        }

        if (data?.referral_code) {
          setReferralCode(data.referral_code);
        }
        if (data?.display_name) {
          setDisplayName(data.display_name);
        }

        // Auto-open WhatsApp invite modal if not yet completed
        if (!data?.congrats_completed) {
          setShowInviteModal(true);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Failed to fetch profile:", err);
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user, loading, navigate]);

  const shareUrl = referralCode
    ? `${window.location.origin}/r/${referralCode}`
    : "";

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share it with friends to spread the blessings.",
    });
  };

  // Short, punchy share texts optimized for each platform
  const tiktokText = `🎁 Someone is GRATEFUL for you!\nThey just sent you a FREE wristband ($11 value)\n\n✅ Waterproof nylon — wear it everywhere\n✅ Or grab all 3 colors for $22\n\n💰 PLUS: Join the FREE 3-Day Gratitude Challenge & win $1,111!\n\nClaim yours 👇\n${shareUrl}`;
  const instagramText = `🎁 Someone just sent you a FREE "I Am Blessed AF" Wristband!\n\nThey're grateful for YOU 🙏\n\n✅ FREE wristband ($11 value)\n✅ Waterproof nylon — daily gratitude trigger\n💰 PLUS: Join the 3-Day Challenge & win $1,111!\n\nClaim yours → ${shareUrl}\n\n#grateful #blessed #iamblessedaf #gratitudechallenge`;
  const youtubeText = `🎁 Gift a FREE Wristband to Someone You're Grateful For!\n\nSend a FREE "I Am Blessed AF" wristband ($11 value) to someone you care about.\n\n✅ Waterproof nylon — wear it daily as a gratitude trigger\n💰 PLUS they can join the 3-Day Gratitude Challenge & win $1,111!\n\nSend the gift: ${shareUrl}`;
  const twitterText = `🎁 Just sent someone a FREE wristband because I'm grateful for them!\n\n✅ $11 value — waterproof nylon gratitude trigger\n💰 + FREE 3-Day Challenge to win $1,111\n\nSend one to someone you love 👇`;
  const facebookText = `🎁 I just sent someone a FREE "I Am Blessed AF" wristband ($11 value) because I'm grateful for them! Waterproof nylon you wear daily as a gratitude trigger. PLUS they can join the FREE 3-Day Gratitude Challenge and win $1,111! Send one to someone you love 🙏`;
  const whatsappText = `🎁 I just blessed someone with a FREE wristband! 🙏\n\nEach one helps feed 11 people when you wear it.\n\nGet yours FREE here: ${shareUrl}`;

  const shareToWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(waUrl, "_blank");
  };

  const shareToTikTok = () => {
    navigator.clipboard.writeText(tiktokText);
    toast({
      title: "Caption ready! 📋",
      description: "Opening TikTok - just paste & post!",
    });
    window.open("https://www.tiktok.com/creator-center/upload", "_blank");
  };

  const shareToInstagram = () => {
    navigator.clipboard.writeText(instagramText);
    toast({
      title: "Caption ready! 📋",
      description: "Opening Instagram - paste in your story or post!",
    });
    window.open("https://www.instagram.com/create/story", "_blank");
  };

  const shareToYouTube = () => {
    navigator.clipboard.writeText(youtubeText);
    toast({
      title: "Description ready! 📋",
      description: "Opening YouTube - paste in your Short or video!",
    });
    window.open("https://www.youtube.com/shorts", "_blank");
  };

  const shareToTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(tweetUrl, "_blank", "width=550,height=420");
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(facebookText)}`;
    window.open(fbUrl, "_blank", "width=550,height=420");
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!referralCode) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Almost there!</h1>
          <p className="text-muted-foreground mb-6">
            Join the free challenge to get your unique referral link.
          </p>
          <Button onClick={() => navigate("/")}>
            Join the Free Challenge
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GamificationHeader />
      <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-12 sm:pt-10">
      <div className="max-w-md w-full text-center">
        {/* Success check — compact */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
          className="mb-4"
        >
          <div className="relative inline-block">
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <div className="relative bg-primary rounded-full p-4 inline-block shadow-glow">
              <CheckCircle className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
        </motion.div>

        {/* Logo — tighter */}
        <motion.img
          src={logo}
          alt="I am Blessed AF"
          className="w-full max-w-[280px] sm:max-w-sm h-auto object-contain mx-auto mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        />

        {/* Benefit-driven headline */}
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-3 leading-tight tracking-tight"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isReferred ? (
            "Your Gift is Ready! 🎁"
          ) : (
            <>
              You're In! Now Turn Your Gratitude Into{" "}
              <span className="text-primary">Something Real.</span>
            </>
          )}
        </motion.h1>

        {/* Sub-headline — benefit-first */}
        <motion.p
          className="text-base sm:text-lg text-muted-foreground mb-6 max-w-sm mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isReferred
            ? "Your FREE wristband is reserved. Complete shipping below to claim it!"
            : "Your challenge starts tomorrow. While you wait — one tap feeds 11 hungry people and earns you the Gratitude Identity."}
        </motion.p>

        {/* Primary CTA — Go to Dashboard (where WhatsApp invite modal awaits) */}
        {!isReferred && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", bounce: 0.3 }}
            className="mb-8"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              onClick={() => setShowInviteModal(true)}
            >
              💬 Invitar Amigos por WhatsApp
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Envía tu gratitud a 3 amigos y activa tu cuenta
            </p>
          </motion.div>
        )}

        {/* Wristband Claim CTA for referred users */}
        {isReferred && (
          <motion.div
            className="bg-card rounded-2xl shadow-premium p-6 mb-8 border border-primary/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Claim Your FREE Wristband</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your gift is reserved! Tap below to choose your wristband and claim it.
            </p>
            <Button
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => navigate("/")}
            >
              🎁 Claim My FREE Wristband →
            </Button>
          </motion.div>
        )}

        {/* Next Steps Card */}
        <motion.div
          className="bg-card rounded-2xl shadow-premium p-6 mb-8 border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="font-bold text-lg mb-4">
            {isReferred ? "Plus: Join the FREE Challenge!" : "What Happens Next?"}
          </h2>

          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-lg p-2 mt-0.5">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Check your inbox</p>
                <p className="text-sm text-muted-foreground">
                  Day 1 instructions arrive at 8am tomorrow
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-lg p-2 mt-0.5">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Watch for texts</p>
                <p className="text-sm text-muted-foreground">
                  We'll SMS you a reminder each morning
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Share Section */}
        <motion.div
          className="bg-secondary/50 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-primary" />
            <h3 className="font-bold">🎁 Gift a FREE Wristband</h3>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Send a <span className="font-semibold text-foreground">FREE wristband</span> to someone you're grateful for. 
            They'll get to choose their option at checkout.
          </p>

          {/* Referral Link */}
          <div className="flex items-center gap-2 bg-background rounded-lg p-3 mb-4">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm truncate outline-none"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button
              variant="default"
              size="sm"
              onClick={shareToWhatsApp}
              className="bg-[hsl(120_100%_50%)] hover:bg-[hsl(120_100%_40%)] text-white"
            >
              <span className="ml-2">💬 WhatsApp</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={shareToTikTok}
              className="bg-foreground hover:bg-foreground/90 text-background"
            >
              <TikTokIcon />
              <span className="ml-2">TikTok</span>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button
              variant="default"
              size="sm"
              onClick={shareToInstagram}
              className="bg-primary hover:bg-primary/90"
            >
              <InstagramIcon />
              <span className="ml-2">Instagram</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareToYouTube}
              className="text-primary hover:bg-accent"
            >
              <YouTubeIcon />
              <span className="ml-1.5 text-xs">YouTube</span>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={shareToTwitter}>
              <TwitterIcon />
              <span className="ml-1.5 text-xs">X</span>
            </Button>
            <Button variant="outline" size="sm" onClick={shareToFacebook}>
              <FacebookIcon />
              <span className="ml-1.5 text-xs">Facebook</span>
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-xs text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Questions? Reply to any of our emails.
        </motion.p>
      </div>
      </div>

      {/* WhatsApp Invite Modal */}
      {referralCode && (
        <InviteFriendsModal
          open={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            navigate("/affiliate-portal");
          }}
          referralCode={referralCode}
          displayName={displayName}
        />
      )}
    </div>
  );
};

export default ChallengeThanks;
