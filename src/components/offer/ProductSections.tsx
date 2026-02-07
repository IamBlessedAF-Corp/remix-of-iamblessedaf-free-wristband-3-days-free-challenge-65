import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageZoomModal from "./ImageZoomModal";
import productTshirtFront from "@/assets/product-tshirt-front.webp";
import productTshirtBack from "@/assets/product-tshirt-back.webp";
import productFriendShirt from "@/assets/product-friend-shirt.png";
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
}: {
  src: string;
  alt: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-16 h-16 md:w-20 md:h-20 rounded-none border-2 overflow-hidden transition-all flex-shrink-0 ${
      active
        ? "border-foreground"
        : "border-border/50 hover:border-foreground/40"
    }`}
  >
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  </button>
);

/* ══════════════════════════════════════════════════
   Main T-Shirt — Shopify-style product card
   ══════════════════════════════════════════════════ */
const TshirtProductSection = ({ delay = 0 }: { delay?: number }) => {
  const [zoomed, setZoomed] = useState(false);
  const [zoomedImage, setZoomedImage] = useState("");
  const [view, setView] = useState<"front" | "back">("front");
  const [selectedSize, setSelectedSize] = useState("M");

  const images = [
    { key: "front" as const, src: productTshirtFront, label: "Front" },
    { key: "back" as const, src: productTshirtBack, label: "Back" },
  ];
  const currentImage = view === "front" ? productTshirtFront : productTshirtBack;

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
          {/* Image gallery */}
          <div className="relative bg-secondary/30">
            <div
              className="cursor-zoom-in aspect-square flex items-center justify-center p-4"
              onClick={() => handleZoom(currentImage)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={view}
                  src={currentImage}
                  alt={`T-Shirt ${view}`}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 px-4 py-3 border-t border-border/30">
            {images.map((img) => (
              <Thumbnail
                key={img.key}
                src={img.src}
                alt={img.label}
                active={view === img.key}
                onClick={() => setView(img.key)}
              />
            ))}
          </div>

          {/* Product info */}
          <div className="px-4 pb-5 pt-3 space-y-4">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-foreground tracking-tight leading-snug">
                Streetwear Loose Drop Shoulder T-Shirt
              </h3>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                Double-sided print · Premium cotton
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">$111</span>
              <span className="text-base text-muted-foreground line-through">$333</span>
              <span className="text-xs font-semibold text-primary ml-1 uppercase">Save 67%</span>
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
              🌍 Free International Shipping
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
const FriendShirtSection = ({ delay = 0 }: { delay?: number }) => {
  const [zoomed, setZoomed] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");

  return (
    <>
      {zoomed && (
        <ImageZoomModal
          image={productFriendShirt}
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
          {/* Image */}
          <div className="relative bg-secondary/30">
            <div
              className="cursor-zoom-in aspect-square flex items-center justify-center p-4"
              onClick={() => setZoomed(true)}
            >
              <img
                src={productFriendShirt}
                alt="Friend Shirt"
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
            {/* FREE badge */}
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 uppercase tracking-wider">
              Free
            </div>
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
              <span className="text-xs font-semibold text-primary ml-1 uppercase">Included</span>
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
              🌍 Free International Shipping
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
              🌍 Free International Shipping
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
const ProductSections = () => {
  return (
    <div className="space-y-6">
      <TshirtProductSection delay={0.4} />
      <FriendShirtSection delay={0.6} />
      <WristbandSection delay={0.8} />
    </div>
  );
};

export default ProductSections;
