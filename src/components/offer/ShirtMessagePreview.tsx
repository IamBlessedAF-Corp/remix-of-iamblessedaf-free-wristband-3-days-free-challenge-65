import { useRef, useState } from "react";
import { PenLine, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import shirtMockup from "@/assets/shirt-mockup-blank.png";

const FONT_FAMILY = "'Indie Flower', cursive";
const MAX_CHARS = 130;

interface ShirtMessagePreviewProps {
  message: string;
  onChange?: (message: string) => void;
}

/** Shared shirt text overlay — used in both inline and zoomed views */
const ShirtTextOverlay = ({
  message,
  isEditable,
  isFocused,
  inputRef,
  onFocus,
  onBlur,
  onChange,
  onTap,
  scale = 1,
}: {
  message: string;
  isEditable: boolean;
  isFocused: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (msg: string) => void;
  onTap?: () => void;
  scale?: number;
}) => (
  <div
    className="absolute flex flex-col items-center justify-start overflow-hidden"
    style={{
      top: "43%",
      left: "34%",
      width: "32%",
      height: "26.5%",
    }}
  >
    {/* Static prefix lines */}
    <p
      className="text-foreground leading-tight font-semibold text-center pointer-events-none"
      style={{
        fontFamily: FONT_FAMILY,
        fontSize: `clamp(${0.4 * scale}rem, ${1.6 * scale}vw, ${0.75 * scale}rem)`,
      }}
    >
      To Have a Best Friend
    </p>
    <p
      className="text-foreground leading-tight font-semibold mt-0.5 text-center pointer-events-none"
      style={{
        fontFamily: FONT_FAMILY,
        fontSize: `clamp(${0.35 * scale}rem, ${1.4 * scale}vw, ${0.65 * scale}rem)`,
      }}
    >
      Gave me this shirt and said;
    </p>
    <p
      className="text-foreground leading-tight font-semibold mt-0.5 text-center pointer-events-none"
      style={{
        fontFamily: FONT_FAMILY,
        fontSize: `clamp(${0.35 * scale}rem, ${1.4 * scale}vw, ${0.65 * scale}rem)`,
      }}
    >
      "TY! I'll Never Forget when You...
    </p>

    {/* Editable area */}
    {isEditable && onChange ? (
      <div className="w-full mt-0.5 relative cursor-text" onClick={onTap}>
        {!message && !isFocused && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none z-10">
            <PenLine
              className="text-primary animate-pulse"
              style={{ width: `clamp(8px, ${1.5 * scale}vw, 14px)`, height: `clamp(8px, ${1.5 * scale}vw, 14px)` }}
            />
            <span
              className="text-muted-foreground/70 italic"
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: `clamp(${0.25 * scale}rem, ${1.1 * scale}vw, ${0.5 * scale}rem)`,
              }}
            >
              Tap to write...
            </span>
          </div>
        )}
        <textarea
          ref={inputRef}
          value={message}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              onChange(e.target.value);
            }
          }}
          maxLength={MAX_CHARS}
          className="w-full bg-transparent border-0 outline-none resize-none text-foreground text-center p-0 m-0 leading-snug placeholder:text-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: `clamp(${0.28 * scale}rem, ${1.2 * scale}vw, ${0.55 * scale}rem)`,
            minHeight: `clamp(16px, ${4 * scale}vw, 40px)`,
            caretColor: "hsl(var(--primary))",
          }}
          rows={2}
        />
        {message && (
          <span
            className="text-foreground font-medium pointer-events-none block text-center -mt-1"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: `clamp(${0.28 * scale}rem, ${1.2 * scale}vw, ${0.55 * scale}rem)`,
            }}
          >
            "
          </span>
        )}
      </div>
    ) : (
      message ? (
        <p
          className="text-foreground leading-snug font-medium mt-0.5 break-words whitespace-pre-wrap text-center pointer-events-none"
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: `clamp(${0.3 * scale}rem, ${1.3 * scale}vw, ${0.6 * scale}rem)`,
          }}
        >
          {message}"
        </p>
      ) : (
        <p
          className="text-muted-foreground leading-snug font-medium mt-0.5 text-center italic pointer-events-none"
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: `clamp(${0.3 * scale}rem, ${1.3 * scale}vw, ${0.6 * scale}rem)`,
          }}
        >
          [Your message here]"
        </p>
      )
    )}
  </div>
);

const ShirtMessagePreview = ({ message, onChange }: ShirtMessagePreviewProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isEditable = !!onChange;

  const handleTap = () => {
    if (isEditable) inputRef.current?.focus();
  };

  return (
    <>
      <div className="w-full mx-auto select-none" style={{ maxWidth: "614px" }}>
        {/* Shirt image with print area overlay */}
        <div className="relative w-full group">
          <img
            src={shirtMockup}
            alt="Shirt Mockup Preview"
            className="w-full h-auto object-contain cursor-zoom-in"
            draggable={false}
            onClick={() => setIsZoomed(true)}
          />

          {/* Dashed print area */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "42%",
              left: "32.5%",
              width: "35%",
              height: "28.5%",
              border: "2px dashed rgba(0,0,0,0.2)",
              borderRadius: "4px",
            }}
          />

          {/* Inline text overlay */}
          <ShirtTextOverlay
            message={message}
            isEditable={isEditable}
            isFocused={isFocused}
            inputRef={inputRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={onChange}
            onTap={handleTap}
          />

          {/* Zoom hint icon */}
          <button
            onClick={() => setIsZoomed(true)}
            className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md opacity-70 group-hover:opacity-100 transition-opacity"
            aria-label="Zoom shirt preview"
          >
            <ZoomIn className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Character counter */}
        {isEditable && (
          <div className="flex justify-center mt-1.5">
            <span
              className={`text-xs font-medium ${
                MAX_CHARS - message.length <= 20
                  ? MAX_CHARS - message.length <= 0
                    ? "text-destructive"
                    : "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {MAX_CHARS - message.length} / {MAX_CHARS}
            </span>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white z-50"
            >
              <span className="sr-only">Close</span>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <motion.div
              className="relative w-full max-w-2xl"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={shirtMockup}
                alt="Shirt Mockup Zoomed"
                className="w-full h-auto object-contain rounded-lg"
              />
              {/* Zoomed text overlay — read-only, larger scale */}
              <ShirtTextOverlay
                message={message}
                isEditable={false}
                isFocused={false}
                scale={1.3}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShirtMessagePreview;
