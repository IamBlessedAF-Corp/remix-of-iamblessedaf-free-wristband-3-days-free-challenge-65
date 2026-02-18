import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ShareMilestoneTracker from "@/components/viral/ShareMilestoneTracker";
import { LayoutDashboard, Trophy, Share2, ShoppingBag, Target, Activity, LogOut, Loader2, Rocket, ArrowRight } from "lucide-react";
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
import EmbeddedClipperDashboard from "@/components/portal/EmbeddedClipperDashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logoImg from "@/assets/logo.png";

type Tab = "dashboard" | "leaderboard" | "referrals" | "store" | "missions" | "clipper";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clipper", label: "Clip & Earn", icon: Rocket },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "referrals", label: "Referrals", icon: Share2 },
  { id: "missions", label: "Missions", icon: Target },
  { id: "store", label: "Store", icon: ShoppingBag },
];

const Portal = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showAuth, setShowAuth] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const { user, loading: authLoading, signOut } = useAuth();
  const portalData = usePortalData();
  const navigate = useNavigate();

  const handleUpgradeToAffiliate = useCallback(async () => {
    if (!user) return;
    setUpgrading(true);
    try {
      // Ensure affiliate_tiers row exists (starter tier)
      const { data: existing } = await (supabase.from("affiliate_tiers" as any) as any)
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        await (supabase.from("affiliate_tiers" as any) as any).insert({
          user_id: user.id,
          current_tier: "starter",
          credit_amount: 3300,
          wristbands_distributed: 0,
        });
      }

      toast({ title: "🚀 Affiliate Activated!", description: "Welcome to the Affiliate Portal." });
      navigate("/affiliate-portal");
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong. Try again." });
    } finally {
      setUpgrading(false);
    }
  }, [user, navigate]);

  // Loading state
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

  // Not logged in — redirect to home
  if (!user) {
    navigate("/", { replace: true });
    return null;
  }

  // Logged in but no creator profile
  if (!portalData.profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img src={logoImg} alt="Logo" className="h-12 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            You're signed in but don't have a creator profile yet. Visit the contest page to set up your ambassador profile.
          </p>
          <div className="flex gap-3">
           <Button
              onClick={() => window.location.href = "/3300us-Credit"}
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
            >
              Become an Affiliate
            </Button>
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="h-11 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Logo" className="h-7" />
            <span className="text-sm font-bold text-foreground hidden sm:inline">Ambassador Portal</span>
          </div>
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
      </header>

      {/* Tab navigation */}
      <nav className="sticky top-[57px] z-30 bg-background border-b border-border/30 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
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
                {/* Affiliate Upgrade CTA */}
                <motion.div
                  className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-6"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        Unlock Your FREE <span className="text-primary">$3,300 Marketing Credit</span>
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Upgrade to the Affiliate Portal — access Clip & Earn, Repost & Earn, tier tracking, and more. Same account, no re-login needed.
                      </p>
                    </div>
                    <Button
                      onClick={handleUpgradeToAffiliate}
                      disabled={upgrading}
                      className="w-full sm:w-auto h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl gap-2 px-6 shrink-0"
                    >
                      {upgrading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Upgrade Now <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>

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
              <PortalLeaderboard
                leaderboard={portalData.leaderboard}
                currentUserId={user.id}
              />
            )}
            {activeTab === "referrals" && (
              <PortalReferralHub
                profile={portalData.profile}
                blessings={portalData.blessings}
                userId={user.id}
                onBlessingCreated={portalData.refreshBlessings}
              />
            )}
            {activeTab === "clipper" && (
              <EmbeddedClipperDashboard userId={user.id} />
            )}
            {activeTab === "missions" && <PortalMissions />}
            {activeTab === "store" && (
              <PortalRewardsStore
                userId={user.id}
                balance={portalData.wallet?.balance ?? 0}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Portal;
