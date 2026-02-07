import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import productTshirt from "@/assets/product-tshirt.png";
import productFriendShirt from "@/assets/product-friend-shirt.png";
import productWristbands from "@/assets/product-wristbands.avif";

const ImageZoomModal = ({
  image,
  alt,
  onClose,
}: {
  image: string;
  alt: string;
  onClose: () => void;
}) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white z-50"
      >
        <X className="w-8 h-8" />
      </button>
      <motion.img
        src={image}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  </AnimatePresence>
);

const ProductSection = ({
  title,
  subtitle,
  image,
  originalPrice,
  price,
  isFree,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  image: string;
  originalPrice: string;
  price: string;
  isFree?: boolean;
  delay?: number;
}) => {
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      {zoomed && (
        <ImageZoomModal
          image={image}
          alt={title}
          onClose={() => setZoomed(false)}
        />
      )}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-1 italic">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
        )}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-soft">
          <div
            className="cursor-zoom-in relative group"
            onClick={() => setZoomed(true)}
          >
            <img
              src={image}
              alt={title}
              className="w-full h-auto object-contain"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
              <span className="text-xs bg-foreground/70 text-background px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to zoom
              </span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between border-t border-border/30">
            <div>
              <p className="text-xs text-muted-foreground">Intl Delivery</p>
              <div className="flex items-center gap-2">
                <span className="text-lg text-muted-foreground line-through">
                  {originalPrice}
                </span>
                <span
                  className={`text-xl font-bold ${isFree ? "text-primary" : "text-foreground"}`}
                >
                  {price}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const ProductSections = () => {
  return (
    <div>
      <ProductSection
        title="Streetwear Loose Drop Shoulder T-Shirt"
        subtitle="One-side print included"
        image={productTshirt}
        originalPrice="$333"
        price="$111"
        delay={0.4}
      />

      <motion.div
        className="h-px bg-border/50 my-8"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      />

      <ProductSection
        title="FREE Custom Shirt for your Best Friend"
        subtitle="IamBlessedAF to have U as a Best Friend — One-side print included"
        image={productFriendShirt}
        originalPrice="$111"
        price="FREE"
        isFree
        delay={0.6}
      />

      <motion.div
        className="h-px bg-border/50 my-8"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      />

      <ProductSection
        title="3 Trigger Reminders Wristbands"
        subtitle="NFC Tab Wristband: Tap Bracelet to Review · Share Custom Link · Waterproof Silicone"
        image={productWristbands}
        originalPrice="$11"
        price="FREE"
        isFree
        delay={0.8}
      />
    </div>
  );
};

export default ProductSections;
