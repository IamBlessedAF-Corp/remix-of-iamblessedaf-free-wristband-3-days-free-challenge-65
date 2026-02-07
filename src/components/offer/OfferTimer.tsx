import { Timer } from "lucide-react";
import useCountdown from "@/hooks/useCountdown";

const OfferTimer = () => {
  const { mins, secs, expired } = useCountdown(15);

  return (
    <div className="flex items-center justify-center gap-2">
      <Timer className="w-4 h-4 text-primary animate-pulse" />
      <p className="text-sm font-bold text-primary">
        {expired
          ? "Offer expired!"
          : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")} left to claim`}
      </p>
    </div>
  );
};

export default OfferTimer;
