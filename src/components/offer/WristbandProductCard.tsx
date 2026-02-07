import { useState } from "react";
import { motion } from "framer-motion";
import ImageZoomModal from "./ImageZoomModal";
import productWristbands from "@/assets/product-wristbands.avif";

const WristbandProductCard = ({ delay = 0 }: { delay?: number }) => {
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      {zoomed && (
        <ImageZoomModal
          image={productWristbands}
          alt="Trigger Reminder Wristbands"
          onClose={() => setZoomed(false)}
        />
      )}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <div className="bg-card rounded-none border border-border/60 overflow-hidden">
          <div className="relative bg-secondary/30">
            <div
              className="cursor-zoom-in aspect-[4/3] flex items-center justify-center p-4"
              onClick={() => setZoomed(true)}
            >
              <img
                src={productWristbands}
                alt="3 Trigger Reminders Wristbands"
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>

          <div className="px-4 pb-5 pt-4 space-y-3 border-t border-border/30">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground tracking-tight leading-snug">
                3 Trigger Reminders Wristbands
              </h3>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                NFC Tap · Share Custom Link · Waterproof Silicone
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">$22</span>
              <span className="text-base text-muted-foreground line-through">$33</span>
              <span className="text-xs font-semibold text-primary ml-1 uppercase">One-time</span>
            </div>

            <p className="text-xs text-muted-foreground pt-1">
              🇺🇸 Free US Shipping · International $14.95 Flat
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default WristbandProductCard;
