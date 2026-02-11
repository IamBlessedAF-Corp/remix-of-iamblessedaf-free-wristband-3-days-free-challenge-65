import GamificationHeader from "@/components/funnel/GamificationHeader";
import { usePageMeta } from "@/hooks/usePageMeta";
import ImpactMealHero from "@/components/impact/ImpactMealHero";
import DonationMap from "@/components/impact/DonationMap";
import MilestoneTimeline from "@/components/impact/MilestoneTimeline";
import ImpactCta from "@/components/impact/ImpactCta";

const Impact = () => {
  usePageMeta({
    title: "Our Impact | Meals Donated Worldwide | I am Blessed AF",
    description: "Track how our gratitude community feeds families around the world. Every wristband and pack purchased donates meals to Feeding America.",
    image: "/og-image.png",
    url: "https://iamblessedaf.com/impact",
  });

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
