import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Challenge from "./pages/Challenge";
import ChallengeThanks from "./pages/ChallengeThanks";
import Confirm from "./pages/Confirm";
import Offer22 from "./pages/Offer22";
import Offer111 from "./pages/Offer111";
import Offer111Grok from "./pages/Offer111Grok";
import Offer111Gpt from "./pages/Offer111Gpt";
import Offer444 from "./pages/Offer444";
import OfferMonthly from "./pages/OfferMonthly";
import Offer1111 from "./pages/Offer1111";
import Offer4444 from "./pages/Offer4444";
import AIVideoContest from "./pages/AIVideoContest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/challenge/thanks" element={<ChallengeThanks />} />
          <Route path="/confirm/:token" element={<Confirm />} />
          <Route path="/offer/22" element={<Offer22 />} />
          <Route path="/offer/111" element={<Offer111 />} />
          <Route path="/offer/111/grok" element={<Offer111Grok />} />
          <Route path="/offer/111/gpt" element={<Offer111Gpt />} />
          <Route path="/offer/444" element={<Offer444 />} />
          <Route path="/offer/11mo" element={<OfferMonthly />} />
          <Route path="/offer/1111" element={<Offer1111 />} />
          <Route path="/offer/4444" element={<Offer4444 />} />
          <Route path="/make-2500-with-1-ai-clip" element={<AIVideoContest />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
