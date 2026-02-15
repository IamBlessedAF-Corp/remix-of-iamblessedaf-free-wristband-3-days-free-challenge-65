import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Offer22 from "./pages/Offer22";
import Challenge from "./pages/Challenge";
import ChallengeThanks from "./pages/ChallengeThanks";
import ReferralRedirect from "./pages/ReferralRedirect";
import GoRedirect from "./pages/GoRedirect";
import Confirm from "./pages/Confirm";
import Offer111 from "./pages/Offer111";
import Offer111Grok from "./pages/Offer111Grok";
import Offer111Gpt from "./pages/Offer111Gpt";
import Offer444 from "./pages/Offer444";
import OfferMonthly from "./pages/OfferMonthly";
import Offer1111 from "./pages/Offer1111";
import Offer4444 from "./pages/Offer4444";
import OfferSuccess from "./pages/OfferSuccess";
import AIVideoContest from "./pages/AIVideoContest";
import Board from "./pages/Board";
import Portal from "./pages/Portal";
import AdminLinks from "./pages/AdminLinks";
import Impact from "./pages/Impact";
import Roadmap from "./pages/Roadmap";
import ClipperDashboard from "./pages/ClipperDashboard";
import ClipperAdmin from "./pages/ClipperAdmin";
import Experts from "./pages/Experts";
import ScriptsReview from "./pages/ScriptsReview";
import GratitudeClippers from "./pages/GratitudeClippers";
import FunnelMap from "./pages/FunnelMap";
import ExpertsLeadsAdmin from "./pages/ExpertsLeadsAdmin";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import SmartWristband from "./pages/SmartWristband";
import ReserveSmartWristband from "./pages/ReserveSmartWristband";
import FreeNeuroHackerWristband from "./pages/FreeNeuroHackerWristband";
import NotFound from "./pages/NotFound";
import CreditExpert from "./pages/CreditExpert";
import CreditNMarketer from "./pages/CreditNMarketer";
import CreditREAgent from "./pages/CreditREAgent";
import CreditAffiliateMarketer from "./pages/CreditAffiliateMarketer";
import CreditClipper from "./pages/CreditClipper";
import CreditPortal from "./pages/CreditPortal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Offer22 />} />
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/challenge/thanks" element={<ChallengeThanks />} />
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
          <Route path="/make-2500-with-1-ai-clip" element={<AIVideoContest />} />
          <Route path="/2us-Clippers-Campaign" element={<AIVideoContest />} />
          <Route path="/board" element={<Board />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/admin/links" element={<AdminLinks />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/clipper-dashboard" element={<ClipperDashboard />} />
          <Route path="/admin/clippers" element={<ClipperAdmin />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/scripts-review" element={<ScriptsReview />} />
          <Route path="/Gratitude-Clippers" element={<GratitudeClippers />} />
          <Route path="/Traffic-Funnel" element={<FunnelMap />} />
          <Route path="/admin/experts" element={<ExpertsLeadsAdmin />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/Reserve-your-Neuro-Hack-Wristband-SMART" element={<SmartWristband />} />
          <Route path="/Reserve-a-SMART-wristband" element={<ReserveSmartWristband />} />
          <Route path="/neuro-hacker-waitlist" element={<SmartWristband />} />
          <Route path="/FREE-neuro-hacker-wristband" element={<FreeNeuroHackerWristband />} />

          {/* ═══ New $3,300 Credit Funnels ═══ */}
          <Route path="/3300us-Credit-Expert" element={<CreditExpert />} />
          <Route path="/3300us-Credit-N-Marketer" element={<CreditNMarketer />} />
          <Route path="/3300us-Credit-RE-Agent" element={<CreditREAgent />} />
          <Route path="/3300us-Credit-Affiliate-Marketer" element={<CreditAffiliateMarketer />} />
          <Route path="/3300us-Credit-Marketer" element={<CreditAffiliateMarketer />} />
          <Route path="/3300us-Credit-Clipper" element={<CreditClipper />} />
          <Route path="/3300us-Credit" element={<CreditPortal />} />

          {/* Legacy redirects */}
          <Route path="/experts-leads" element={<Navigate to="/3300us-Credit-Expert" replace />} />
          <Route path="/network-marketers" element={<Navigate to="/3300us-Credit-N-Marketer" replace />} />
          <Route path="/realtors-list-activation" element={<Navigate to="/3300us-Credit-RE-Agent" replace />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
