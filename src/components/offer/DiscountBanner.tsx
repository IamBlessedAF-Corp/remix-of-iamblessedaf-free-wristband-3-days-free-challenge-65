import { Timer } from "lucide-react";
import useCountdown from "@/hooks/useCountdown";

const DiscountBanner = () => {
  const { mins, secs, expired } = useCountdown(15);

  return (
    <div className="space-y-3">
      {/* GRATITUDE PACK heading */}
      <p className="text-3xl md:text-4xl font-black text-primary">
        GRATITUDE PACK
      </p>

      {/* Timer + value breakdown */}
      <div className="bg-card border border-border/50 rounded-xl p-3 shadow-soft">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Timer className="w-4 h-4 text-primary animate-pulse" />
          <p className="text-sm font-bold text-primary">
            {expired ? "Offer expired!" : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} left at this price`}
          </p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You're getting a <span className="font-bold text-foreground">$333 shirt</span> in a{" "}
          <span className="font-bold text-foreground">$499 pack</span> — today only
        </p>
      </div>

      {/* 77% OFF badge */}
      <p className="text-2xl md:text-3xl font-black text-primary">
        77% OFF TODAY
      </p>

      {/* Value proposition + price */}
      <div className="flex items-center justify-center gap-4">
        <p className="text-lg md:text-xl font-bold text-foreground leading-tight text-left">
          Get Best Friend's Custom Shirt + 3 Neuro-Hacker Wristbands
          <br />
          Pack for <span className="text-primary">FREE</span>
        </p>

        <div className="bg-card border border-border/50 rounded-xl px-4 py-3 text-center shadow-soft">
          <p className="text-xs text-muted-foreground mb-0.5">Intl Delivery</p>
          <p className="text-base text-muted-foreground line-through leading-tight">$477</p>
          <p className="text-2xl font-bold text-primary leading-tight">$111</p>
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;
