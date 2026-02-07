import { motion } from "framer-motion";

const DiscountBanner = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <span className="text-5xl md:text-6xl font-black text-primary leading-none whitespace-nowrap">
          77% OFF
        </span>
        <div className="text-left">
          <p className="text-xl md:text-2xl font-bold text-foreground leading-tight">
            Buy 1 Shirt & Get this
            <br />
            Pack for <span className="text-primary">FREE</span>
          </p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 text-right shadow-soft">
          <p className="text-xs text-muted-foreground">Intl Delivery</p>
          <p className="text-lg text-muted-foreground line-through">$477</p>
          <p className="text-2xl font-bold text-primary">$111</p>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscountBanner;
