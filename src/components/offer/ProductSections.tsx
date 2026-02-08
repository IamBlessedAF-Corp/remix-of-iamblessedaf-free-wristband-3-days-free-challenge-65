import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageZoomModal from "./ImageZoomModal";
import ShirtMessagePreview from "./ShirtMessagePreview";
import productTshirtFront from "@/assets/product-tshirt-front.webp";
import productTshirtBack from "@/assets/product-tshirt-back.webp";
import productTshirtVideo from "@/assets/product-tshirt-video2.mp4";
import productTshirtModel1 from "@/assets/product-tshirt-model1.png";
import productTshirtModel2 from "@/assets/product-tshirt-model2.png";
import productTshirtModel3 from "@/assets/product-tshirt-model3.png";
import shirtMockupFront from "@/assets/shirt-mockup-blank.png";
import shirtMockupBack from "@/assets/shirt-mockup-back.png";
import friendShirtVideo from "@/assets/friend-shirt-video.mp4";
import friendShirtModel1 from "@/assets/friend-shirt-model1.png";
import friendShirtModel2 from "@/assets/friend-shirt-model2.png";
import friendShirtModel3 from "@/assets/friend-shirt-model3.png";
import productWristbands from "@/assets/product-wristbands.avif";

const TSHIRT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];

/* ── Size Button ── */
const SizeButton = ({
  size,
  selected,
  onClick,
}: {
  size: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`min-w-[3.25rem] h-11 px-3 text-sm font-medium rounded-none border transition-all ${
      selected
        ? "border-foreground bg-foreground text-background"
        : "border-border text-foreground hover:border-foreground"
    }`}
  >
    {size}
  </button>
);

/* ── Thumbnail ── */
const Thumbnail = ({
  src,
  alt,
  active,
  onClick,
  isVideo,
}: {
  src: string;
  alt: string;
  active: boolean;
  onClick: () => void;
  isVideo?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-16 h-16 md:w-20 md:h-20 rounded-none border-2 overflow-hidden transition-all flex-shrink-0 relative ${
      active
        ? "border-foreground"
        : "border-border/50 hover:border-foreground/40"
    }`}
  >
    {isVideo ? (
      <>
        <video src={src} className="w-full h-full object-cover" muted preload="metadata" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-foreground ml-0.5" />
          </div>
        </div>
      </>
    ) : (
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    )}
  </button>
);

/* ══════════════════════════════════════════════════
   Main T-Shirt — Shopify-style product card
   ══════════════════════════════════════════════════ */
const TshirtProductSection = ({ delay = 0 }: { delay?: number }) => {
  const [zoomed, setZoomed] = useState(false);
  const [zoomedImage, setZoomedImage] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");

  const media = [
    { type: "image" as const, src: productTshirtFront, label: "Front" },
    { type: "image" as const, src: productTshirtBack, label: "Back" },
    { type: "image" as const, src: productTshirtModel2, label: "Model 2" },
    { type: "image" as const, src: productTshirtModel3, label: "Model 3" },
    { type: "image" as const, src: productTshirtModel1, label: "Model 1" },
    { type: "video" as const, src: productTshirtVideo, label: "Video" },
  ];
  const current = media[activeIndex];

  const handleZoom = (img: string) => {
    setZoomedImage(img);
    setZoomed(true);
  };

  return (
    <>
      {zoomed && (
        <ImageZoomModal
          image={zoomedImage}
          alt="Streetwear T-Shirt"
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
          {/* Media gallery */}
          <div className="relative bg-secondary/30">
            <div
              className={`${current.type === "image" ? "cursor-zoom-in" : ""} aspect-square flex items-center justify-center p-4`}
              onClick={() => current.type === "image" && handleZoom(current.src)}
            >
              <AnimatePresence mode="wait">
                {current.type === "image" ? (
                  <motion.img
                    key={activeIndex}
                    src={current.src}
                    alt={`T-Shirt ${current.label}`}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                ) : (
                  <motion.video
                    key={activeIndex}
                    src={current.src}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 px-4 py-3 border-t border-border/30">
            {media.map((item, idx) => (
              <Thumbnail
                key={idx}
                src={item.src}
                alt={item.label}
                active={activeIndex === idx}
                onClick={() => setActiveIndex(idx)}
                isVideo={item.type === "video"}
              />
            ))}
          </div>

          {/* Product info */}
          <div className="px-4 pb-5 pt-3 space-y-4">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground tracking-tight leading-snug">
                "IamBlessedAF" Streetwear Loose Drop Shoulder T-Shirt
              </h3>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                Double-sided print · Premium cotton
              </p>
            </div>


            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-foreground uppercase tracking-wider">
                  Size
                </p>
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{selectedSize}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TSHIRT_SIZES.map((size) => (
                  <SizeButton
                    key={size}
                    size={size}
                    selected={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                  />
                ))}
              </div>
            </div>

            {/* Shipping note */}
            <p className="text-xs text-muted-foreground pt-1">
              🇺🇸 Free US Shipping · International $14.95 Flat
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

/* ══════════════════════════════════════════════════
   Friend Shirt — Shopify-style product card
   ══════════════════════════════════════════════════ */
const FriendShirtSection = ({ delay = 0, afterHeroSlot, message = "" }: { delay?: number; afterHeroSlot?: React.ReactNode; message?: string }) => {
  const [zoomed, setZoomed] = useState(false);
  const [zoomedImage, setZoomedImage] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");

  // First item is the live preview component, rest are standard images/video
  const media = [
    { type: "preview" as const, src: shirtMockupFront, label: "Front Preview" },
    { type: "image" as const, src: shirtMockupBack, label: "Back" },
    { type: "image" as const, src: friendShirtModel1, label: "Model 1" },
    { type: "image" as const, src: friendShirtModel2, label: "Model 2" },
    { type: "image" as const, src: friendShirtModel3, label: "Model 3" },
    { type: "video" as const, src: friendShirtVideo, label: "Video" },
  ];
  const safeIndex = activeIndex >= media.length ? 0 : activeIndex;
  const current = media[safeIndex];

  const handleZoom = (img: string) => {
    setZoomedImage(img);
    setZoomed(true);
  };

  return (
    <>
      {zoomed && (
        <ImageZoomModal
          image={zoomedImage}
          alt="Friend Shirt"
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
          {/* Media gallery */}
          <div className="relative bg-secondary/30">
            <div
              className={`${current.type === "image" ? "cursor-zoom-in" : ""} aspect-square flex items-center justify-center p-4`}
              onClick={() => current.type === "image" && handleZoom(current.src)}
            >
              <AnimatePresence mode="wait">
                {current.type === "preview" ? (
                  <motion.div
                    key="preview"
                    className="w-full h-full flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ShirtMessagePreview message={message} />
                  </motion.div>
                ) : current.type === "image" ? (
                  <motion.img
                    key={activeIndex}
                    src={current.src}
                    alt={`Friend Shirt ${current.label}`}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                ) : (
                  <motion.video
                    key={activeIndex}
                    src={current.src}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </AnimatePresence>
            </div>
            {/* FREE badge */}
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 uppercase tracking-wider">
              Free
            </div>
          </div>

          {/* Slot for custom message box between hero and thumbnails */}
          {afterHeroSlot && (
            <div className="px-4 py-3 border-t border-border/30">
              {afterHeroSlot}
            </div>
          )}

          {/* Thumbnails */}
          <div className="flex gap-2 px-4 py-3 border-t border-border/30 overflow-x-auto">
            {media.map((item, idx) => (
              <Thumbnail
                key={idx}
                src={item.src}
                alt={item.label}
                active={activeIndex === idx}
                onClick={() => setActiveIndex(idx)}
                isVideo={item.type === "video"}
              />
            ))}
          </div>

          {/* Product info */}
          <div className="px-4 pb-5 pt-4 space-y-4 border-t border-border/30">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground tracking-tight leading-snug">
                Custom Shirt for your Best Friend
              </h3>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                IamBlessedAF to have U as a Best Friend · One-side print
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">FREE</span>
              <span className="text-base text-muted-foreground line-through">$111</span>
            </div>

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-foreground uppercase tracking-wider">
                  Size
                </p>
                <p className="text-xs text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{selectedSize}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TSHIRT_SIZES.map((size) => (
                  <SizeButton
                    key={size}
                    size={size}
                    selected={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                  />
                ))}
              </div>
            </div>

            {/* Shipping note */}
            <p className="text-xs text-muted-foreground pt-1">
              🇺🇸 Free US Shipping · International $14.95 Flat
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

/* ══════════════════════════════════════════════════
   Wristbands — Compact accessory card
   ══════════════════════════════════════════════════ */
const WristbandSection = ({ delay = 0 }: { delay?: number }) => {
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
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 uppercase tracking-wider">
              Free
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
              <span className="text-2xl font-bold text-primary">FREE</span>
              <span className="text-base text-muted-foreground line-through">$11</span>
              <span className="text-xs font-semibold text-primary ml-1 uppercase">Included</span>
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

/* ══════════════════════════════════════════════════
   Combined export
   ══════════════════════════════════════════════════ */
const ProductSections = ({ afterWristband }: { afterWristband?: React.ReactNode }) => {
  return (
    <div className="space-y-6">
      <TshirtProductSection delay={0.4} />
      <FriendShirtSection delay={0.6} />
      <WristbandSection delay={0.8} />
      {afterWristband}
    </div>
  );
};

export { FriendShirtSection };
export default ProductSections;
