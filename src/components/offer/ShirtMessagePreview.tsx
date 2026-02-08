import shirtMockup from "@/assets/shirt-mockup-blank.png";

const FONT_FAMILY = "'Indie Flower', cursive";

interface ShirtMessagePreviewProps {
  message: string;
}

const ShirtMessagePreview = ({ message }: ShirtMessagePreviewProps) => {
  const prefixLine1a = "I am Blessed AF";
  const prefixLine1b = "to Have a Best Friend";
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

        {/* Dashed print area rectangle */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "24%",
            left: "22%",
            width: "56%",
            bottom: "12%",
            border: "2px dashed rgba(0,0,0,0.25)",
            borderRadius: "4px",
          }}
        />

        {/* Text overlay — below the red logo, inside the print area */}
        <div
          className="absolute pointer-events-none flex flex-col items-center justify-start overflow-hidden"
          style={{
            top: "46%",
            left: "24%",
            width: "52%",
            bottom: "14%",
          }}
        >
          <p
            className="text-foreground leading-tight font-semibold text-center"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: "clamp(0.45rem, 1.8vw, 0.8rem)",
            }}
          >
            {prefixLine1a}
            <br />
            {prefixLine1b}
          </p>
          <p
            className="text-foreground leading-tight font-semibold mt-0.5 text-center"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: "clamp(0.4rem, 1.6vw, 0.7rem)",
            }}
          >
            {prefixLine2}
          </p>
          {message && (
            <p
              className="text-foreground leading-snug font-medium mt-1 break-words whitespace-pre-wrap text-center"
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: "clamp(0.35rem, 1.4vw, 0.65rem)",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShirtMessagePreview;
