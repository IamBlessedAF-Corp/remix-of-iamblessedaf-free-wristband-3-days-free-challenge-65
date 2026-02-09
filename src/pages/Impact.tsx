import GamificationHeader from "@/components/funnel/GamificationHeader";
import ImpactMealHero from "@/components/impact/ImpactMealHero";
import DonationMap from "@/components/impact/DonationMap";
import MilestoneTimeline from "@/components/impact/MilestoneTimeline";
import ImpactCta from "@/components/impact/ImpactCta";

const Impact = () => {
  return (
    <div className="min-h-screen bg-background">
      <GamificationHeader />

      {/* Full meal counter hero */}
      <ImpactMealHero />

      {/* Live donation map */}
      <DonationMap />

      {/* Milestone timeline */}
      <MilestoneTimeline />

      {/* CTA */}
      <ImpactCta />
    </div>
  );
};

export default Impact;
