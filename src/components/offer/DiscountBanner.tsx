import { motion } from "framer-motion";

const DiscountBanner = () => {
  return (
    <div>

      {/* Value proposition + price */}
      <div className="flex items-center justify-center gap-4">
        <p className="text-lg md:text-xl font-bold text-foreground leading-tight text-left">
          Buy 1 Shirt & Get this
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
