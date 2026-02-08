import shirtMockup from "@/assets/shirt-mockup-blank.png";

const FONT_FAMILY = "'Indie Flower', cursive";

interface ShirtMessagePreviewProps {
  message: string;
}

const ShirtMessagePreview = ({ message }: ShirtMessagePreviewProps) => {
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

        {/* Dashed print area — below the logo, narrower */}
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

        {/* Text overlay — inside the print area */}
        <div
          className="absolute pointer-events-none flex flex-col items-center justify-start overflow-hidden"
          style={{
            top: "43%",
            left: "34%",
            width: "32%",
            height: "26.5%",
          }}
        >
          <p
            className="text-foreground leading-tight font-semibold text-center"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: "clamp(0.4rem, 1.6vw, 0.75rem)",
            }}
          >
            To Have a Best Friend
          </p>
          <p
            className="text-foreground leading-tight font-semibold mt-0.5 text-center"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: "clamp(0.35rem, 1.4vw, 0.65rem)",
            }}
          >
            Gave me this shirt and said;
          </p>
          <p
            className="text-foreground leading-tight font-semibold mt-0.5 text-center"
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: "clamp(0.35rem, 1.4vw, 0.65rem)",
            }}
          >
            "TY! I'll Never Forget when You...
          </p>
          {message ? (
            <p
              className="text-foreground leading-snug font-medium mt-0.5 break-words whitespace-pre-wrap text-center"
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: "clamp(0.3rem, 1.3vw, 0.6rem)",
              }}
            >
              {message}"
            </p>
          ) : (
            <p
              className="text-muted-foreground leading-snug font-medium mt-0.5 text-center italic"
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: "clamp(0.3rem, 1.3vw, 0.6rem)",
              }}
            >
              [Your message here]"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShirtMessagePreview;
