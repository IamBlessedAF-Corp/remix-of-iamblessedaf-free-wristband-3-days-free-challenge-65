import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { X, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type SpinSegment } from "@/hooks/useSpinLogic";

interface SpinWheelProps {
  segments: SpinSegment[];
  isSpinning: boolean;
  hasWon: boolean;
  showWheel: boolean;
  rotation: number;
  onSpin: () => void;
  onClose: () => void;
}

const WHEEL_SIZE = 300;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = WHEEL_SIZE / 2 - 4;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

function WheelSVG({
  segments,
  rotation,
  isSpinning,
}: {
  segments: SpinSegment[];
  rotation: number;
  isSpinning: boolean;
}) {
  const segAngle = 360 / segments.length;

  return (
    <div className="relative" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
      {/* Pointer triangle at top */}
      <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 z-10">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "18px solid hsl(var(--primary))",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
        />
      </div>

      {/* Wheel */}
      <svg
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        className="drop-shadow-xl"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
            : "none",
        }}
      >
        {/* Outer ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + 2}
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
          opacity="0.2"
        />

        {segments.map((seg, i) => {
          const startAngle = i * segAngle;
          const endAngle = startAngle + segAngle;
          const midAngle = startAngle + segAngle / 2;
          const labelPos = polarToCartesian(CENTER, CENTER, RADIUS * 0.62, midAngle);
          const emojiPos = polarToCartesian(CENTER, CENTER, RADIUS * 0.38, midAngle);

          return (
            <g key={i}>
              <path d={describeArc(CENTER, CENTER, RADIUS, startAngle, endAngle)} fill={seg.color} />
              {/* Segment border */}
              <path
                d={describeArc(CENTER, CENTER, RADIUS, startAngle, endAngle)}
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              {/* Label */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
                fontWeight="700"
                style={{
                  textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  transform: `rotate(${midAngle}deg)`,
                  transformOrigin: `${labelPos.x}px ${labelPos.y}px`,
                }}
              >
                {seg.shortLabel}
              </text>
              {/* Emoji */}
              <text
                x={emojiPos.x}
                y={emojiPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="18"
              >
                {seg.emoji}
              </text>
            </g>
          );
        })}

        {/* Center button visual */}
        <circle cx={CENTER} cy={CENTER} r={28} fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="2" />
        <text x={CENTER} y={CENTER} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="800" fill="hsl(var(--foreground))">
          SPIN
        </text>
      </svg>
    </div>
  );
}

export default function SpinWheel({
  segments,
  isSpinning,
  hasWon,
  showWheel,
  rotation,
  onSpin,
  onClose,
}: SpinWheelProps) {
  const navigate = useNavigate();
  const confettiFired = useRef(false);

  // Fire confetti when user wins
  useEffect(() => {
    if (hasWon && !confettiFired.current) {
      confettiFired.current = true;

      // Burst confetti
      const duration = 2500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#ff0000", "#ffd700", "#ff4444", "#ff8800"],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#ff0000", "#ffd700", "#ff4444", "#ff8800"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [hasWon]);

  const handleClaim = () => {
    navigate("/offer/22?source=wheel_win");
  };

  return (
    <AnimatePresence>
      {showWheel && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSpinning && !hasWon ? onClose : undefined}
          />

          {/* Modal content */}
          <motion.div
            className="relative bg-card rounded-2xl shadow-premium border border-border/50 p-6 max-w-sm w-full flex flex-col items-center overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            {!isSpinning && !hasWon && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {!hasWon ? (
              <>
                {/* Pre-spin state */}
                <motion.div
                  className="text-center mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    🎰 Spin to Win!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Try your luck — everyone wins something!
                  </p>
                </motion.div>

                {/* Wheel */}
                <motion.div
                  className="my-4"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.3, damping: 20 }}
                >
                  <WheelSVG
                    segments={segments}
                    rotation={rotation}
                    isSpinning={isSpinning}
                  />
                </motion.div>

                {/* Spin button */}
                <Button
                  onClick={onSpin}
                  disabled={isSpinning}
                  className="w-full h-12 text-base font-bold btn-glow animate-pulse-glow"
                  size="lg"
                >
                  {isSpinning ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">🎡</span> Spinning...
                    </span>
                  ) : (
                    "🎯 SPIN NOW — It's FREE!"
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Win state */}
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200 }}
                >
                  <motion.div
                    className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-4"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Gift className="w-10 h-10 text-primary" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    🎉 YOU WON!
                  </h2>

                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4">
                    <p className="text-lg font-bold text-primary">
                      🎁 FREE Wristband
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      "I Am Blessed AF" wristband — on us!
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    Claim your prize before it expires!
                  </p>

                  <Button
                    onClick={handleClaim}
                    className="w-full h-14 text-lg font-bold btn-glow animate-pulse-glow"
                    size="lg"
                  >
                    Claim My FREE Wristband
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <button
                    onClick={onClose}
                    className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    No thanks, I'll skip this
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
