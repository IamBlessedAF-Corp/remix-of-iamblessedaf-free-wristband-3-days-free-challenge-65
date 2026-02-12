import { Heart } from "lucide-react";

interface MealDonationBadgeProps {
  meals?: number;
  variant?: "inline" | "block";
  className?: string;
}

/**
 * Enhanced meal donation badge with Huberman + Tony Robbins framing.
 * Used across the funnel wherever meal impact is mentioned.
 */
const MealDonationBadge = ({ meals = 11, variant = "inline", className = "" }: MealDonationBadgeProps) => {
  if (variant === "block") {
    return (
      <div className={`bg-primary/5 border border-primary/20 rounded-xl p-4 text-center space-y-2 ${className}`}>
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-primary fill-primary" />
          <p className="text-sm font-bold text-primary">
            🍽 {meals.toLocaleString()} Meals Donated in Honor of Neuroscience
          </p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
          For every wristband claimed & worn — to honor Andrew Huberman's discoveries in
          the Neuroscience of Gratitude — we donate {meals.toLocaleString()} meals to Tony Robbins'{" "}
          <span className="font-semibold text-foreground">"1 Billion Meals Challenge"</span>{" "}
          helping feed 47 million people, including 14 million children, facing hunger.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-1.5 mt-3 mb-1 ${className}`}>
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-primary fill-primary" />
        <p className="text-sm font-semibold text-primary">
          🍽 {meals.toLocaleString()} Meals Donated in Honor of Neuroscience
        </p>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed max-w-sm mx-auto text-center">
        Honoring Andrew Huberman's Gratitude Research — donated to Tony Robbins'{" "}
        <span className="font-semibold text-foreground">"1 Billion Meals Challenge"</span>
      </p>
    </div>
  );
};

export default MealDonationBadge;
