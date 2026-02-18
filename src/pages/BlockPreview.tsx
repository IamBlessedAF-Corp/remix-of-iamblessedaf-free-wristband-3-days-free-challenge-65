import { lazy, Suspense, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

// ─── Lazy-loaded component map ───
const COMPONENT_MAP: Record<string, React.LazyExoticComponent<any>> = {
  // Content
  "GptQuotesSection": lazy(() => import("@/components/offer/gpt/GptQuotesSection")),
  "GrokQuotesSection": lazy(() => import("@/components/offer/grok/GrokQuotesSection")),
  "ResearchList": lazy(() => import("@/components/offer/ResearchList")),
  "EpiphanyBridge": lazy(() => import("@/components/offer/EpiphanyBridge")),
  "GratitudeEngineLoop": lazy(() => import("@/components/offer/GratitudeEngineLoop")),

  // Product
  "ProductSections": lazy(() => import("@/components/offer/ProductSections")),
  "ShirtCustomizer": lazy(() => import("@/components/offer/ShirtCustomizer")),
  "ShopifyStyleCart": lazy(() => import("@/components/offer/ShopifyStyleCart")),
  "WristbandProductCard": lazy(() => import("@/components/offer/WristbandProductCard")),

  // CTA
  "GrokCtaBlock": lazy(() => import("@/components/offer/grok/GrokCtaBlock")),
  "GptCtaBlock": lazy(() => import("@/components/offer/gpt/GptCtaBlock")),
  "Grok444CtaBlock": lazy(() => import("@/components/offer/grok/Grok444CtaBlock")),
  "Grok1111CtaBlock": lazy(() => import("@/components/offer/grok/Grok1111CtaBlock")),
  "Grok4444CtaBlock": lazy(() => import("@/components/offer/grok/Grok4444CtaBlock")),
  "DiscountBanner": lazy(() => import("@/components/offer/DiscountBanner")),

  // Hero
  "GrokHeroSection": lazy(() => import("@/components/offer/grok/GrokHeroSection")),
  "GptHeroSection": lazy(() => import("@/components/offer/gpt/GptHeroSection")),
  "Grok444HeroSection": lazy(() => import("@/components/offer/grok/Grok444HeroSection")),
  "Grok1111HeroSection": lazy(() => import("@/components/offer/grok/Grok1111HeroSection")),
  "Grok4444HeroSection": lazy(() => import("@/components/offer/grok/Grok4444HeroSection")),

  // Trust
  "SocialProofSection": lazy(() => import("@/components/offer/SocialProofSection")),
  "GrokRiskReversal": lazy(() => import("@/components/offer/grok/GrokRiskReversal")),
  "GptRiskReversal": lazy(() => import("@/components/offer/gpt/GptRiskReversal")),
  "RiskReversalGuarantee": lazy(() => import("@/components/offer/RiskReversalGuarantee")),
  "AuthorAvatar": lazy(() => import("@/components/offer/AuthorAvatar")),

  // Urgency
  "OfferTimer": lazy(() => import("@/components/offer/OfferTimer")),
  "UrgencyBanner": lazy(() => import("@/components/offer/UrgencyBanner")),
  "DownsellModal": lazy(() => import("@/components/offer/DownsellModal")),

  // Viral & Gamification
  "GrokViralFooter": lazy(() => import("@/components/offer/grok/GrokViralFooter")),
  "ViralShareNudge": lazy(() => import("@/components/offer/ViralShareNudge")),
  "ImpactCounter": lazy(() => import("@/components/offer/ImpactCounter")),
  "GamificationHeader": lazy(() => import("@/components/funnel/GamificationHeader")),

  // Value Stacks
  "GrokValueStack": lazy(() => import("@/components/offer/grok/GrokValueStack")),
  "GptValueStack": lazy(() => import("@/components/offer/gpt/GptValueStack")),
  "Grok444ValueStack": lazy(() => import("@/components/offer/grok/Grok444ValueStack")),
  "Grok1111ValueStack": lazy(() => import("@/components/offer/grok/Grok1111ValueStack")),
  "Grok4444ValueStack": lazy(() => import("@/components/offer/grok/Grok4444ValueStack")),

  // System
  "ClipActivationGate": lazy(() => import("@/components/clipper/ClipActivationGate")),
  "ClipperBonusLadder": lazy(() => import("@/components/clipper/ClipperBonusLadder")),
  "RiskThrottleIndicator": lazy(() => import("@/components/clipper/RiskThrottleIndicator")),
  "ClipperMyClips": lazy(() => import("@/components/clipper/ClipperMyClips")),
  "ClipperPayoutHistory": lazy(() => import("@/components/clipper/ClipperPayoutHistory")),
  "PortalActivityFeed": lazy(() => import("@/components/portal/PortalActivityFeed")),
};

const Loader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
  </div>
);

export default function BlockPreview() {
  const [params] = useSearchParams();
  const componentName = params.get("component") || "";

  // Clean up body for isolated preview
  useEffect(() => {
    document.body.style.background = "hsl(var(--background))";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  const Component = COMPONENT_MAP[componentName];

  if (!Component) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground text-sm">
        Block preview: <span className="font-mono ml-1">{componentName || "none"}</span>
      </div>
    );
  }

  // Some components need default props
  const getProps = (): Record<string, any> => {
    if (componentName === "AuthorAvatar") return { author: "huberman" };
    if (componentName === "DownsellModal") return { open: true, onClose: () => {} };
    return {};
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <Suspense fallback={<Loader />}>
        <Component {...getProps()} />
      </Suspense>
    </div>
  );
}
