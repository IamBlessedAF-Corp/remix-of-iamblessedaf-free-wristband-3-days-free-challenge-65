import { useRef, useState } from "react";
import { PenLine, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import shirtMockup from "@/assets/shirt-mockup-blank.png";

const FONT_FAMILY = "'Indie Flower', cursive";
const MAX_CHARS = 130;
const MAX_NAME_CHARS = 20;

interface ShirtMessagePreviewProps {
  message: string;
  onChange?: (message: string) => void;
  friendName: string;
  onFriendNameChange?: (name: string) => void;
}

/** Shared shirt text overlay — used in both inline and zoomed views */
const ShirtTextOverlay = ({
  message,
  friendName,
  isEditable,
  isFocused,
  inputRef,
  nameInputRef,
  onFocus,
  onBlur,
  onChange,
  onFriendNameChange,
  onTap,
  onNameTap,
  scale = 1,
}: {
  message: string;
  friendName: string;
  isEditable: boolean;
  isFocused: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  nameInputRef?: React.RefObject<HTMLInputElement>;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (msg: string) => void;
  onFriendNameChange?: (name: string) => void;
  onTap?: () => void;
  onNameTap?: () => void;
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
      className="text-foreground leading-tight font-bold text-center pointer-events-none"
      style={{
        fontFamily: FONT_FAMILY,
        fontSize: `clamp(${0.46 * scale}rem, ${1.85 * scale}vw, ${0.863 * scale}rem)`,
      }}
    >
      I am Blessed AF
    </p>
    <p
      className="text-foreground leading-tight font-semibold text-center pointer-events-none"
      style={{
        fontFamily: FONT_FAMILY,
        fontSize: `clamp(${0.46 * scale}rem, ${1.85 * scale}vw, ${0.863 * scale}rem)`,
      }}
    >
      to Have a Best Friend
    </p>
    {/* Friend name + TY line combined */}
    <div className="w-full mt-0.5 flex items-center justify-center flex-wrap gap-x-1">
      {isEditable && onFriendNameChange ? (
        <div className="relative cursor-text inline-flex items-center" onClick={onNameTap}>
          {!friendName && (
            <span
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 text-primary/60 italic whitespace-nowrap"
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: `clamp(${0.368 * scale}rem, ${1.518 * scale}vw, ${0.661 * scale}rem)`,
              }}
            >
              Name
            </span>
          )}
          <input
            ref={nameInputRef}
            type="text"
            value={friendName}
            onChange={(e) => {
              if (e.target.value.length <= MAX_NAME_CHARS) {
                onFriendNameChange(e.target.value);
              }
            }}
            maxLength={MAX_NAME_CHARS}
            className="bg-transparent border-0 outline-none text-primary text-center p-0 m-0 leading-tight font-bold italic placeholder:text-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: `clamp(${0.397 * scale}rem, ${1.587 * scale}vw, ${0.728 * scale}rem)`,
              caretColor: "hsl(var(--primary))",
              width: friendName ? `${Math.max(friendName.length, 3)}ch` : "4ch",
              minWidth: "3ch",
              maxWidth: "100%",
            }}
          />
        </div>
      ) : (
        <span
          className="text-primary leading-tight font-bold pointer-events-none italic"
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: `clamp(${0.397 * scale}rem, ${1.587 * scale}vw, ${0.728 * scale}rem)`,
          }}
        >
          {friendName || "[Name]"},
        </span>
      )}
      <span
        className="text-foreground leading-tight font-semibold pointer-events-none"
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: `clamp(${0.397 * scale}rem, ${1.587 * scale}vw, ${0.728 * scale}rem)`,
        }}
      >
        TY! I'll Never Forget when You...
      </span>
    </div>

    {/* Editable area */}
    {isEditable && onChange ? (
      <div className="w-full mt-0.5 relative cursor-text" onClick={onTap}>
        {!message && !isFocused && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none z-10">
            <PenLine
              className="text-primary animate-pulse"
              style={{ width: `clamp(10px, ${1.984 * scale}vw, 18px)`, height: `clamp(10px, ${1.984 * scale}vw, 18px)` }}
            />
            <span
              className="text-muted-foreground/70 italic"
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: `clamp(${0.331 * scale}rem, ${1.455 * scale}vw, ${0.661 * scale}rem)`,
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
          className="w-full bg-transparent border-0 outline-none resize-none text-primary font-bold text-center p-0 m-0 leading-snug placeholder:text-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: `clamp(${0.397 * scale}rem, ${1.587 * scale}vw, ${0.728 * scale}rem)`,
            minHeight: `clamp(21px, ${5.29 * scale}vw, 53px)`,
            caretColor: "hsl(var(--primary))",
          }}
          rows={2}
        />
        {message && (
          <span
            className="text-primary font-bold pointer-events-none block text-center -mt-1"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: `clamp(${0.397 * scale}rem, ${1.587 * scale}vw, ${0.728 * scale}rem)`,
            }}
          >
            "
          </span>
        )}
      </div>
    ) : (
      message ? (
        <p
          className="text-primary leading-snug font-bold mt-0.5 break-words whitespace-pre-wrap text-center pointer-events-none"
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: `clamp(${0.397 * scale}rem, ${1.587 * scale}vw, ${0.728 * scale}rem)`,
          }}
        >
          {message}"
        </p>
      ) : (
        <p
          className="text-muted-foreground leading-snug font-bold mt-0.5 text-center italic pointer-events-none"
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: `clamp(${0.397 * scale}rem, ${1.587 * scale}vw, ${0.728 * scale}rem)`,
          }}
        >
          [Your message here]"
        </p>
      )
    )}
  </div>
);

const ShirtMessagePreview = ({ message, onChange, friendName, onFriendNameChange }: ShirtMessagePreviewProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isEditable = !!onChange;

  const handleTap = () => {
    if (isEditable) inputRef.current?.focus();
  };

  const handleNameTap = () => {
    if (isEditable) nameInputRef.current?.focus();
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
            friendName={friendName}
            isEditable={isEditable}
            isFocused={isFocused}
            inputRef={inputRef}
            nameInputRef={nameInputRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={onChange}
            onFriendNameChange={onFriendNameChange}
            onTap={handleTap}
            onNameTap={handleNameTap}
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
                friendName={friendName}
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
