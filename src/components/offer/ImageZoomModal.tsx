import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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

export default ImageZoomModal;
