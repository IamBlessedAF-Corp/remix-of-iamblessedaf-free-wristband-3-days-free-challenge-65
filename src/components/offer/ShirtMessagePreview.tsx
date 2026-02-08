import { useRef, useState } from "react";
import { PenLine } from "lucide-react";
import shirtMockup from "@/assets/shirt-mockup-blank.png";

const FONT_FAMILY = "'Indie Flower', cursive";
const MAX_CHARS = 130;

interface ShirtMessagePreviewProps {
  message: string;
  onChange?: (message: string) => void;
}

const ShirtMessagePreview = ({ message, onChange }: ShirtMessagePreviewProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isEditable = !!onChange;

  const handleTap = () => {
    if (isEditable) inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-lg mx-auto select-none">
      {/* Shirt image with print area overlay */}
      <div className="relative w-full">
        <img
          src={shirtMockup}
          alt="Shirt Mockup Preview"
          className="w-full h-auto object-contain"
          draggable={false}
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

        {/* Text + input overlay — inside the print area */}
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
              fontSize: "clamp(0.4rem, 1.6vw, 0.75rem)",
            }}
          >
            To Have a Best Friend
          </p>
          <p
            className="text-foreground leading-tight font-semibold mt-0.5 text-center pointer-events-none"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: "clamp(0.35rem, 1.4vw, 0.65rem)",
            }}
          >
            Gave me this shirt and said;
          </p>
          <p
            className="text-foreground leading-tight font-semibold mt-0.5 text-center pointer-events-none"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: "clamp(0.35rem, 1.4vw, 0.65rem)",
            }}
          >
            "TY! I'll Never Forget when You...
          </p>

          {/* Editable area — inline on the shirt */}
          {isEditable ? (
            <div
              className="w-full mt-0.5 relative cursor-text"
              onClick={handleTap}
            >
              {/* Blinking pen hint when empty */}
              {!message && !isFocused && (
                <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none z-10">
                  <PenLine
                    className="text-primary animate-pulse"
                    style={{ width: "clamp(8px, 1.5vw, 14px)", height: "clamp(8px, 1.5vw, 14px)" }}
                  />
                  <span
                    className="text-muted-foreground/70 italic"
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: "clamp(0.25rem, 1.1vw, 0.5rem)",
                    }}
                  >
                    Tap to write...
                  </span>
                </div>
              )}
              <textarea
                ref={inputRef}
                value={message}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    onChange(e.target.value);
                  }
                }}
                maxLength={MAX_CHARS}
                className="w-full bg-transparent border-0 outline-none resize-none text-foreground text-center p-0 m-0 leading-snug placeholder:text-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "clamp(0.28rem, 1.2vw, 0.55rem)",
                  minHeight: "clamp(16px, 4vw, 40px)",
                  caretColor: "hsl(var(--primary))",
                }}
                rows={2}
              />
              {/* Closing quote after message */}
              {message && (
                <span
                  className="text-foreground font-medium pointer-events-none block text-center -mt-1"
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "clamp(0.28rem, 1.2vw, 0.55rem)",
                  }}
                >
                  "
                </span>
              )}
            </div>
          ) : (
            /* Read-only display */
            message ? (
              <p
                className="text-foreground leading-snug font-medium mt-0.5 break-words whitespace-pre-wrap text-center pointer-events-none"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "clamp(0.3rem, 1.3vw, 0.6rem)",
                }}
              >
                {message}"
              </p>
            ) : (
              <p
                className="text-muted-foreground leading-snug font-medium mt-0.5 text-center italic pointer-events-none"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "clamp(0.3rem, 1.3vw, 0.6rem)",
                }}
              >
                [Your message here]"
              </p>
            )
          )}
        </div>
      </div>

      {/* Character counter — only when editable */}
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
  );
};

export default ShirtMessagePreview;
