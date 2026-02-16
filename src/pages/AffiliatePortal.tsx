// /3300us-Credit-Portal, /affiliate-dashboard, /affiliate-portal
// Unified affiliate portal — placeholder for Phase 2
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Trophy, Share2, ShoppingBag, Target, Scissors, Video,
  LogOut, Loader2, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePortalData } from "@/hooks/usePortalData";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import PortalDashboard from "@/components/portal/PortalDashboard";
import PortalLeaderboard from "@/components/portal/PortalLeaderboard";
import PortalReferralHub from "@/components/portal/PortalReferralHub";
import PortalRewardsStore from "@/components/portal/PortalRewardsStore";
import PortalMissions from "@/components/portal/PortalMissions";
import PortalActivityFeed from "@/components/portal/PortalActivityFeed";
import ShareMilestoneTracker from "@/components/viral/ShareMilestoneTracker";
import EmbeddedClipperDashboard from "@/components/portal/EmbeddedClipperDashboard";
import ContentVault from "@/components/portal/ContentVault";
import AffiliateCreditTracker from "@/components/portal/AffiliateCreditTracker";
import PortalAccountSettings from "@/components/portal/PortalAccountSettings";
import PortalNotificationBell from "@/components/portal/PortalNotificationBell";
import logoImg from "@/assets/logo.png";

type Tab = "dashboard" | "leaderboard" | "referrals" | "missions" | "store" | "clip" | "repost" | "account";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "referrals", label: "Referrals", icon: Share2 },
  { id: "missions", label: "Missions", icon: Target },
  { id: "clip", label: "Clip & Earn", icon: Scissors },
  { id: "repost", label: "Repost & Earn", icon: Video },
  { id: "store", label: "Store", icon: ShoppingBag },
  { id: "account", label: "Account", icon: Settings },
];

const AffiliatePortal = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showAuth, setShowAuth] = useState(false);
  const { user, loading: authLoading, signOut } = useAuth();
  const portalData = usePortalData();

  if (authLoading || portalData.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (portalData.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <img src={logoImg} alt="Logo" className="h-12 mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
          <p className="text-muted-foreground text-sm">We couldn't load your portal data. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img src={logoImg} alt="Logo" className="h-12 mx-auto" />
          <h1 className="text-3xl font-bold text-foreground">Affiliate Portal</h1>
          <p className="text-muted-foreground">
            Sign in to access your dashboard, track earnings, clip content & earn rewards.
          </p>
          <Button
            onClick={() => setShowAuth(true)}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-xl btn-glow"
          >
            Sign In / Create Account
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.location.href = "/3300us-Credit"}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Affiliate Program
          </Button>
        </motion.div>
        <CreatorSignupModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); window.location.reload(); }}
        />
      </div>
    );
  }

  // Profile is now auto-created in usePortalData, so no intermediate gate needed

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo" className="h-7" />
            <span className="text-sm font-bold text-foreground hidden sm:inline">Affiliate Portal</span>
          </div>
          <div className="flex items-center gap-1">
            <PortalNotificationBell userId={user.id} />
            <Button
              onClick={() => signOut()}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="sticky top-[57px] z-30 bg-background border-b border-border/30 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <AffiliateCreditTracker
                  referralCode={portalData.profile?.referral_code}
                  userId={user.id}
                  userEmail={user.email || ""}
                  displayName={portalData.profile?.display_name || undefined}
                />
                <PortalDashboard
                  profile={portalData.profile}
                  wallet={portalData.wallet}
                  blessings={portalData.blessings}
                  userId={user.id}
                  onClaimDaily={portalData.claimDailyBonus}
                />
                <PortalActivityFeed />
                <ShareMilestoneTracker />
              </div>
            )}
            {activeTab === "leaderboard" && (
              <PortalLeaderboard leaderboard={portalData.leaderboard} currentUserId={user.id} />
            )}
            {activeTab === "referrals" && (
              <PortalReferralHub
                profile={portalData.profile}
                blessings={portalData.blessings}
                userId={user.id}
                onBlessingCreated={portalData.refreshBlessings}
              />
            )}
            {activeTab === "missions" && <PortalMissions />}
            {activeTab === "clip" && <EmbeddedClipperDashboard userId={user.id} />}
            {activeTab === "repost" && <ContentVault referralCode={portalData.profile?.referral_code} userId={user.id} />}
            {activeTab === "store" && (
              <PortalRewardsStore userId={user.id} balance={portalData.wallet?.balance ?? 0} />
            )}
            {activeTab === "account" && (
              <PortalAccountSettings
                userId={user.id}
                userEmail={user.email || ""}
                profile={portalData.profile}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AffiliatePortal;
