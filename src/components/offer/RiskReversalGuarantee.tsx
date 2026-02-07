import { Shield } from "lucide-react";

const RiskReversalGuarantee = () => (
  <div className="mt-4 text-center">
    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1">
      <Shield className="w-3.5 h-3.5 text-primary" />
      Happiness Guarantee
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
      Send the 3 Gratitude texts and use the pack for at least 3 days. If you don't feel happier after receiving responses from your loved ones — full refund, no questions asked.
    </p>
  </div>
);

export default RiskReversalGuarantee;
