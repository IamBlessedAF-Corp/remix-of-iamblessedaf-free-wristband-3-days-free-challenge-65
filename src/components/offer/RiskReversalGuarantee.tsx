import { ShieldCheck } from "lucide-react";

const RiskReversalGuarantee = () => (
  <div className="mt-4 text-center">
    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1">
      <ShieldCheck className="w-4 h-4 text-primary" />
      Gratitude Guarantee
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
      Every wristband claimed feeds 11 people through Feeding America. Wear it daily as your gratitude trigger. 🙏
    </p>
  </div>
);

export default RiskReversalGuarantee;
