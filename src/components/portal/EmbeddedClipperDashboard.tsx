import { useState } from "react";
import { motion } from "framer-motion";
import { useClipperDashboard } from "@/hooks/useClipperDashboard";
import ClipperStatusHeader from "@/components/clipper/ClipperStatusHeader";
import ClipperWeeklySnapshot from "@/components/clipper/ClipperWeeklySnapshot";
import ClipperBonusLadder from "@/components/clipper/ClipperBonusLadder";
import ClipperMomentum from "@/components/clipper/ClipperMomentum";
import ClipperActivationTrigger from "@/components/clipper/ClipperActivationTrigger";
import ClipperNextAction from "@/components/clipper/ClipperNextAction";
import ClipperPayoutHistory from "@/components/clipper/ClipperPayoutHistory";
import ClipperMyClips from "@/components/clipper/ClipperMyClips";
import ClipSubmitModal from "@/components/clipper/ClipSubmitModal";
import ClipperPersonalAnalytics from "@/components/clipper/ClipperPersonalAnalytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface EmbeddedClipperDashboardProps {
  userId: string;
}

const EmbeddedClipperDashboard = ({ userId }: EmbeddedClipperDashboardProps) => {
  const dashboard = useClipperDashboard(userId);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const handleSubmitClip = () => setShowSubmitModal(true);
  const isActivated = dashboard.totalClips >= 2 || dashboard.clipsToday >= 3;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="w-full bg-secondary/50">
          <TabsTrigger value="dashboard" className="flex-1">Clipper Dashboard</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">📊 Analytics</TabsTrigger>
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
            <ClipperBonusLadder
              totalViews={dashboard.totalViews}
              avgViewsPerWeek={dashboard.avgViewsPerClipPerWeek}
              clipsThisWeek={dashboard.clipsThisWeek}
              viewsThisWeek={dashboard.viewsThisWeek}
            />
            <ClipperMomentum
              clipsThisWeek={dashboard.clipsThisWeek}
              clipsLastWeek={dashboard.clipsLastWeek}
              streakDays={dashboard.streakDays}
              totalClips={dashboard.totalClips}
            />
            <ClipperMyClips userId={userId} />
            <ClipperPayoutHistory userId={userId} />
            {isActivated && (
              <ClipperNextAction
                clipsThisWeek={dashboard.clipsThisWeek}
                onSubmitClip={handleSubmitClip}
              />
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="analytics">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ClipperPersonalAnalytics userId={userId} />
          </motion.div>
        </TabsContent>
      </Tabs>

      <ClipSubmitModal
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        userId={userId}
        onSubmitted={dashboard.refresh}
      />
    </div>
  );
};

export default EmbeddedClipperDashboard;
