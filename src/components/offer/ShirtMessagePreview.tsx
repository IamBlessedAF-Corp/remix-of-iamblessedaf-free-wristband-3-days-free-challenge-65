import { useState } from "react";
import shirtMockup from "@/assets/shirt-mockup-blank.png";

export const FONT_OPTIONS = [
  { id: "caveat", label: "Caveat", family: "'Caveat', cursive" },
  { id: "dancing", label: "Dancing Script", family: "'Dancing Script', cursive" },
  { id: "satisfy", label: "Satisfy", family: "'Satisfy', cursive" },
  { id: "pacifico", label: "Pacifico", family: "'Pacifico', cursive" },
  { id: "indie", label: "Indie Flower", family: "'Indie Flower', cursive" },
] as const;

export type FontId = (typeof FONT_OPTIONS)[number]["id"];

interface ShirtMessagePreviewProps {
  message: string;
  selectedFont?: FontId;
  onFontChange?: (font: FontId) => void;
}

const ShirtMessagePreview = ({
  message,
  selectedFont = "caveat",
  onFontChange,
}: ShirtMessagePreviewProps) => {
  const [internalFont, setInternalFont] = useState<FontId>("caveat");

  const activeFont = selectedFont ?? internalFont;
  const setFont = (f: FontId) => {
    if (onFontChange) onFontChange(f);
    else setInternalFont(f);
  };

  const fontFamily =
    FONT_OPTIONS.find((f) => f.id === activeFont)?.family ?? FONT_OPTIONS[0].family;

  const prefixLine1 = "I am Blessed AF to Have a Best Friend";
  const prefixLine2 = "TY! I'll Never Forget when You...";

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

        {/* Text overlay — below the red logo, inside the dashed print area with safe margins */}
        <div
          className="absolute pointer-events-none flex flex-col items-center justify-start overflow-hidden"
          style={{
            top: "44%",
            left: "28%",
            width: "44%",
            bottom: "22%",
          }}
        >
          <p
            className="text-foreground leading-tight font-semibold text-center"
            style={{
              fontFamily,
              fontSize: "clamp(0.45rem, 1.8vw, 0.8rem)",
            }}
          >
            {prefixLine1}
          </p>
          <p
            className="text-foreground leading-tight font-semibold mt-0.5 text-center"
            style={{
              fontFamily,
              fontSize: "clamp(0.4rem, 1.6vw, 0.7rem)",
            }}
          >
            {prefixLine2}
          </p>
          {message && (
            <p
              className="text-foreground leading-snug font-medium mt-1 break-words whitespace-pre-wrap text-center"
              style={{
                fontFamily,
                fontSize: "clamp(0.35rem, 1.4vw, 0.65rem)",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Font selector — 5 options */}
      <div className="mt-4 mb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-2">
          ✍️ Choose Handwriting Style
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              onClick={() => setFont(font.id)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-200 ${
                activeFont === font.id
                  ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                  : "border-border/60 bg-card text-foreground hover:border-primary/40"
              }`}
              style={{ fontFamily: font.family }}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShirtMessagePreview;
