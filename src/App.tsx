import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { AuthRedirectListener } from "@/components/AuthRedirectListener";

// ─── Lazy-loaded pages ───
const Offer22 = lazy(() => import("./pages/Offer22"));
const Challenge = lazy(() => import("./pages/Challenge"));
const ChallengeThanks = lazy(() => import("./pages/ChallengeThanks"));
const ChallengeInvite = lazy(() => import("./pages/ChallengeInvite"));
const ChallengeStory = lazy(() => import("./pages/ChallengeStory"));
const Keys = lazy(() => import("./pages/Keys"));
const ReferralRedirect = lazy(() => import("./pages/ReferralRedirect"));
const GoRedirect = lazy(() => import("./pages/GoRedirect"));
const Confirm = lazy(() => import("./pages/Confirm"));
const Offer111 = lazy(() => import("./pages/Offer111"));
const Offer111Grok = lazy(() => import("./pages/Offer111Grok"));
const Offer111Gpt = lazy(() => import("./pages/Offer111Gpt"));
const Offer444 = lazy(() => import("./pages/Offer444"));
const OfferMonthly = lazy(() => import("./pages/OfferMonthly"));
const Offer1111 = lazy(() => import("./pages/Offer1111"));
const Offer4444 = lazy(() => import("./pages/Offer4444"));
const OfferSuccess = lazy(() => import("./pages/OfferSuccess"));
const AIVideoContest = lazy(() => import("./pages/AIVideoContest"));
const AdminHub = lazy(() => import("./pages/AdminHub"));
const Portal = lazy(() => import("./pages/Portal"));
const Impact = lazy(() => import("./pages/Impact"));
const ClipperDashboard = lazy(() => import("./pages/ClipperDashboard"));
const Experts = lazy(() => import("./pages/Experts"));
const ScriptsReview = lazy(() => import("./pages/ScriptsReview"));
const GratitudeClippers = lazy(() => import("./pages/GratitudeClippers"));
const FunnelMap = lazy(() => import("./pages/FunnelMap"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const SmartWristband = lazy(() => import("./pages/SmartWristband"));
const ReserveSmartWristband = lazy(() => import("./pages/ReserveSmartWristband"));
const FreeNeuroHackerWristband = lazy(() => import("./pages/FreeNeuroHackerWristband"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CreditExpert = lazy(() => import("./pages/CreditExpert"));
const CreditNMarketer = lazy(() => import("./pages/CreditNMarketer"));
const CreditREAgent = lazy(() => import("./pages/CreditREAgent"));
const CreditAffiliateMarketer = lazy(() => import("./pages/CreditAffiliateMarketer"));
const CreditClipper = lazy(() => import("./pages/CreditClipper"));
const CreditInfluencer = lazy(() => import("./pages/CreditInfluencer"));
const CreditPodcastHost = lazy(() => import("./pages/CreditPodcastHost"));
const CreditGymOwner = lazy(() => import("./pages/CreditGymOwner"));
const CreditHealthCoach = lazy(() => import("./pages/CreditHealthCoach"));
const CreditPortal = lazy(() => import("./pages/CreditPortal"));
const AffiliatePortal = lazy(() => import("./pages/AffiliatePortal"));
const DiamondAmbassador = lazy(() => import("./pages/DiamondAmbassador"));
const UnsubscribeDigest = lazy(() => import("./pages/UnsubscribeDigest"));
const CongratsNeuroHacker = lazy(() => import("./pages/CongratsNeuroHacker"));
const BlockPreview = lazy(() => import("./pages/BlockPreview"));
const CoFounder = lazy(() => import("./pages/CoFounder"));
const OfferWristband = lazy(() => import("./pages/OfferWristband"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthRedirectListener />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Offer22 />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/challenge" element={<Challenge />} />
            <Route path="/challenge/thanks" element={<ChallengeThanks />} />
            <Route path="/challenge/invite" element={<ChallengeInvite />} />
            <Route path="/challenge/story" element={<ChallengeStory />} />
            <Route path="/keys" element={<Keys />} />
            <Route path="/r/:code" element={<ReferralRedirect />} />
            <Route path="/go/:code" element={<GoRedirect />} />
            <Route path="/confirm/:token" element={<Confirm />} />
            <Route path="/offer/111" element={<Offer111 />} />
            <Route path="/offer/111/grok" element={<Offer111Grok />} />
            <Route path="/offer/111/gpt" element={<Offer111Gpt />} />
            <Route path="/offer/444" element={<Offer444 />} />
            <Route path="/offer/11mo" element={<OfferMonthly />} />
            <Route path="/offer/1111" element={<Offer1111 />} />
            <Route path="/offer/4444" element={<Offer4444 />} />
            <Route path="/offer/success" element={<OfferSuccess />} />
            <Route path="/offer/wristband" element={<OfferWristband />} />
            <Route path="/make-2500-with-1-ai-clip" element={<AIVideoContest />} />
            <Route path="/2us-Clippers-Campaign" element={<AIVideoContest />} />

            {/* ═══ Unified Admin Hub ═══ */}
            <Route path="/admin" element={<AdminHub />} />
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
            <Route path="/board" element={<Navigate to="/admin" replace />} />
            <Route path="/roadmap" element={<Navigate to="/admin" replace />} />

            {/* ═══ Co-Founder EOS Hub ═══ */}
            <Route path="/co-founder" element={<CoFounder />} />

            <Route path="/portal" element={<Portal />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/clipper-dashboard" element={<ClipperDashboard />} />
            <Route path="/experts" element={<Experts />} />
            <Route path="/scripts-review" element={<ScriptsReview />} />
            <Route path="/Gratitude-Clips-Challenge" element={<GratitudeClippers />} />
            <Route path="/Gratitude-Clippers" element={<Navigate to="/Gratitude-Clips-Challenge" replace />} />
            <Route path="/Traffic-Funnel" element={<FunnelMap />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/Reserve-your-Neuro-Hack-Wristband-SMART" element={<SmartWristband />} />
            <Route path="/Reserve-a-SMART-wristband" element={<ReserveSmartWristband />} />
            <Route path="/neuro-hacker-waitlist" element={<SmartWristband />} />
            <Route path="/FREE-neuro-hacker-wristband" element={<FreeNeuroHackerWristband />} />

            {/* ═══ $3,300 Credit Funnels ═══ */}
            <Route path="/3300us-Credit" element={<CreditPortal />} />
            <Route path="/3300us-Credit-Expert" element={<CreditExpert />} />
            <Route path="/3300us-Credit-N-Marketer" element={<CreditNMarketer />} />
            <Route path="/3300us-Credit-RE-Agent" element={<CreditREAgent />} />
            <Route path="/3300us-Credit-Affiliate-Marketer" element={<CreditAffiliateMarketer />} />
            <Route path="/3300us-Credit-Marketer" element={<CreditAffiliateMarketer />} />
            <Route path="/3300us-Credit-Clipper" element={<CreditClipper />} />
            <Route path="/3300us-Credit-Influencer" element={<CreditInfluencer />} />
            <Route path="/3300us-Credit-Podcast-Host" element={<CreditPodcastHost />} />
            <Route path="/3300us-Credit-Gym-Owner" element={<CreditGymOwner />} />
            <Route path="/3300us-Credit-Health-Coach" element={<CreditHealthCoach />} />

            {/* ═══ Affiliate Portal ═══ */}
            <Route path="/3300us-Credit-Portal" element={<AffiliatePortal />} />
            <Route path="/affiliate-dashboard" element={<AffiliatePortal />} />
            <Route path="/affiliate-portal" element={<AffiliatePortal />} />
            <Route path="/diamond-ambassador" element={<DiamondAmbassador />} />
            <Route path="/Congrats-Neuro-Hacker" element={<CongratsNeuroHacker />} />
            <Route path="/unsubscribe-digest" element={<UnsubscribeDigest />} />

            {/* Legacy redirects */}
            <Route path="/experts-leads" element={<Navigate to="/3300us-Credit-Expert" replace />} />
            <Route path="/network-marketers" element={<Navigate to="/3300us-Credit-N-Marketer" replace />} />
            <Route path="/realtors-list-activation" element={<Navigate to="/3300us-Credit-RE-Agent" replace />} />

            <Route path="/block-preview" element={<BlockPreview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
