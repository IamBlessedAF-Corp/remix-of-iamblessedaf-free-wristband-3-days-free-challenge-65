import friendShirtFront from "@/assets/friend-shirt-front.png";

interface ShirtMessagePreviewProps {
  message: string;
}

const ShirtMessagePreview = ({ message }: ShirtMessagePreviewProps) => {
  const prefixLine1 = "I am Blessed AF to Have a Best Friend";
  const prefixLine2 = "TY! I'll Never Forget when You...";

  return (
    <div className="relative w-full max-w-md mx-auto select-none">
      {/* Shirt image */}
      <img
        src={friendShirtFront}
        alt="Friend Shirt Preview"
        className="w-full h-auto object-contain"
        draggable={false}
      />

      {/* Text overlay — positioned on the shirt chest area */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ paddingTop: "28%", paddingBottom: "20%", paddingLeft: "18%", paddingRight: "18%" }}
      >
        <div className="text-center w-full">
          <p
            className="text-foreground leading-tight font-semibold"
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "clamp(0.65rem, 2.2vw, 1rem)",
            }}
          >
            {prefixLine1}
          </p>
          <p
            className="text-foreground leading-tight font-semibold mt-0.5"
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "clamp(0.6rem, 2vw, 0.9rem)",
            }}
          >
            {prefixLine2}
          </p>
          {message && (
            <p
              className="text-foreground leading-snug font-medium mt-1 break-words whitespace-pre-wrap"
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "clamp(0.55rem, 1.8vw, 0.85rem)",
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
