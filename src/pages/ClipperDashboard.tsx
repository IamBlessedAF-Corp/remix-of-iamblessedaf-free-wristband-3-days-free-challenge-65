import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useClipperDashboard } from "@/hooks/useClipperDashboard";
import { useClipperEconomy } from "@/hooks/useClipperEconomy";
import { supabase } from "@/integrations/supabase/client";
import ClipperStatusHeader from "@/components/clipper/ClipperStatusHeader";
import ClipperWeeklySnapshot from "@/components/clipper/ClipperWeeklySnapshot";
import ClipperBonusLadder from "@/components/clipper/ClipperBonusLadder";
import ClipperMomentum from "@/components/clipper/ClipperMomentum";
import ClipperActivationTrigger from "@/components/clipper/ClipperActivationTrigger";
import ClipperNextAction from "@/components/clipper/ClipperNextAction";
import ClipperPayoutHistory from "@/components/clipper/ClipperPayoutHistory";
import ClipperMyClips from "@/components/clipper/ClipperMyClips";
import ClipSubmitModal from "@/components/clipper/ClipSubmitModal";
import ClipperRepostGallery from "@/components/clipper/ClipperRepostGallery";
import ClipperPersonalAnalytics from "@/components/clipper/ClipperPersonalAnalytics";
import PayoutCountdown from "@/components/clipper/PayoutCountdown";
import RiskThrottleIndicator from "@/components/clipper/RiskThrottleIndicator";
import MonthlyBonusTracker from "@/components/clipper/MonthlyBonusTracker";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import logoImg from "@/assets/logo.png";
import GratitudeDegenBlock from "@/components/contest/GratitudeDegenBlock";
import EarningsSliderCalculator from "@/components/contest/EarningsSliderCalculator";
import ClipperCtaAssets from "@/components/contest/ClipperCtaAssets";
import InspirationGallery from "@/components/contest/InspirationGallery";

const ClipperDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const dashboard = useClipperDashboard(user?.id);
  const economy = useClipperEconomy(user?.id);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("creator_profiles")
      .select("referral_code")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.referral_code) setReferralCode(data.referral_code);
      });
  }, [user?.id]);

  const referralLink = referralCode ? `https://iamblessedaf.com/r/${referralCode}` : null;

  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get("tab") === "post" ? "post" : urlParams.get("tab") === "repost" ? "repost" : "dashboard";

  const handleSubmitClip = () => setShowSubmitModal(true);

  if (authLoading || dashboard.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Sign in to access your clipper dashboard.</p>
          <Button onClick={() => (window.location.href = "/Gratitude-Clips-Challenge")}>
            Go to Campaign Page
          </Button>
        </div>
      </div>
    );
  }

  const isActivated = dashboard.totalClips >= 2 || dashboard.clipsToday >= 3;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" className="p-1" onClick={() => (window.location.href = "/Gratitude-Clips-Challenge")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <img src={logoImg} alt="Logo" className="h-6" />
            <span className="text-sm font-bold text-foreground">Clipper Dashboard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="text-xs gap-1 text-primary border-primary/30" onClick={() => (window.location.href = "/portal")}>
              🪙 Portal & Store
            </Button>
            <Button onClick={() => signOut()} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard sections */}
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <Tabs defaultValue={initialTab} className="space-y-4">
          <TabsList className="w-full bg-secondary/50">
            <TabsTrigger value="dashboard" className="flex-1 text-xs">Dashboard</TabsTrigger>
            <TabsTrigger value="post" className="flex-1 text-xs">🎬 Post</TabsTrigger>
            <TabsTrigger value="repost" className="flex-1 text-xs">🔁 Repost</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 text-xs">📊 Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <ClipperStatusHeader
                totalViews={dashboard.totalViews}
                totalEarningsCents={dashboard.totalEarningsCents}
                lastPayoutDate={dashboard.lastPayoutDate}
              />
              <RiskThrottleIndicator />
              <PayoutCountdown />
              <ClipperActivationTrigger
                totalClips={dashboard.totalClips}
                clipsToday={dashboard.clipsToday}
                onSubmitClip={handleSubmitClip}
              />
              <ClipperWeeklySnapshot
                clipsThisWeek={dashboard.clipsThisWeek}
                viewsThisWeek={dashboard.viewsThisWeek}
                earningsThisWeekCents={dashboard.earningsThisWeekCents}
              />
              <MonthlyBonusTracker userId={user.id} totalLifetimeViews={dashboard.totalViews} />
              <ClipperMomentum
                clipsThisWeek={dashboard.clipsThisWeek}
                clipsLastWeek={dashboard.clipsLastWeek}
                streakDays={dashboard.streakDays}
                totalClips={dashboard.totalClips}
              />
              <ClipperMyClips userId={user.id} />
              <ClipperPayoutHistory userId={user.id} />
              {isActivated && (
                <ClipperNextAction
                  clipsThisWeek={dashboard.clipsThisWeek}
                  onSubmitClip={handleSubmitClip}
                />
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="post">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-0"
            >
              <GratitudeDegenBlock referralLink={referralLink} />
              <EarningsSliderCalculator referralLink={referralLink} />
              <ClipperCtaAssets referralLink={referralLink} referralCode={referralCode} />
              <InspirationGallery referralLink={referralLink} />
            </motion.div>
          </TabsContent>

          <TabsContent value="repost">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <MonthlyBonusTracker userId={user.id} totalLifetimeViews={dashboard.totalViews} />
              <ClipperRepostGallery userId={user.id} referralLink={referralLink} referralCode={referralCode} />
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <PayoutCountdown />
              <MonthlyBonusTracker userId={user.id} totalLifetimeViews={dashboard.totalViews} />
              <ClipperBonusLadder
                totalViews={dashboard.totalViews}
                avgViewsPerWeek={dashboard.avgViewsPerClipPerWeek}
                clipsThisWeek={dashboard.clipsThisWeek}
                viewsThisWeek={dashboard.viewsThisWeek}
              />
              <ClipperPersonalAnalytics userId={user.id} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <ClipSubmitModal
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        userId={user.id}
        onSubmitted={dashboard.refresh}
        referralCode={referralCode}
      />
    </div>
  );
};

export default ClipperDashboard;
