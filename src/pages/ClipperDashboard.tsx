import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useClipperDashboard } from "@/hooks/useClipperDashboard";
import ClipperStatusHeader from "@/components/clipper/ClipperStatusHeader";
import ClipperWeeklySnapshot from "@/components/clipper/ClipperWeeklySnapshot";
import ClipperBonusLadder from "@/components/clipper/ClipperBonusLadder";
import ClipperMomentum from "@/components/clipper/ClipperMomentum";
import ClipperNextAction from "@/components/clipper/ClipperNextAction";
import ClipperLeaderboard from "@/components/clipper/ClipperLeaderboard";
import ClipperPayoutHistory from "@/components/clipper/ClipperPayoutHistory";
import ClipSubmitModal from "@/components/clipper/ClipSubmitModal";
import { useClipperLeaderboard } from "@/hooks/useClipperLeaderboard";
import logoImg from "@/assets/logo.png";

const ClipperDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const dashboard = useClipperDashboard(user?.id);
  const lb = useClipperLeaderboard(user?.id);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const handleSubmitClip = () => {
    setShowSubmitModal(true);
  };

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
          <Button onClick={() => (window.location.href = "/2us-Clippers-Campaign")}>
            Go to Campaign Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => (window.location.href = "/2us-Clippers-Campaign")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <img src={logoImg} alt="Logo" className="h-6" />
            <span className="text-sm font-bold text-foreground">Clipper Dashboard</span>
          </div>
          <Button
            onClick={() => signOut()}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Dashboard sections */}
      <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* 1. Status & Trust */}
          <ClipperStatusHeader
            totalViews={dashboard.totalViews}
            totalEarningsCents={dashboard.totalEarningsCents}
            lastPayoutDate={dashboard.lastPayoutDate}
          />

          {/* 2. This Week */}
          <ClipperWeeklySnapshot
            clipsThisWeek={dashboard.clipsThisWeek}
            viewsThisWeek={dashboard.viewsThisWeek}
            earningsThisWeekCents={dashboard.earningsThisWeekCents}
          />

          {/* 3. Bonus Ladder */}
          <ClipperBonusLadder totalViews={dashboard.totalViews} avgViewsPerWeek={dashboard.avgViewsPerClipPerWeek} />

          {/* 4. Momentum */}
          <ClipperMomentum
            clipsThisWeek={dashboard.clipsThisWeek}
            clipsLastWeek={dashboard.clipsLastWeek}
            streakDays={dashboard.streakDays}
            totalClips={dashboard.totalClips}
          />

          {/* 5. Leaderboard */}
          <ClipperLeaderboard
            leaderboard={lb.leaderboard}
            isLive={lb.isLive}
            loading={lb.loading}
          />

          {/* 6. Payout History */}
          <ClipperPayoutHistory userId={user.id} />

          {/* 7. Next Action */}
          <ClipperNextAction
            clipsThisWeek={dashboard.clipsThisWeek}
            onSubmitClip={handleSubmitClip}
          />
        </motion.div>
      </main>

      <ClipSubmitModal
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        userId={user.id}
        onSubmitted={dashboard.refresh}
      />
    </div>
  );
};

export default ClipperDashboard;
