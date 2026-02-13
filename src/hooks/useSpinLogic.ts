import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "spin_wheel_claimed";

export interface SpinSegment {
  label: string;
  shortLabel: string;
  emoji: string;
  color: string;
}

export const SEGMENTS: SpinSegment[] = [
  { label: "FREE Neuro-Hacker Wristband", shortLabel: "Wristband", emoji: "🎁", color: "hsl(0, 100%, 50%)" },
  { label: "10 Blessed Coins", shortLabel: "10 BC", emoji: "🪙", color: "hsl(45, 90%, 50%)" },
  { label: "5 Hearts", shortLabel: "5 Hearts", emoji: "💚", color: "hsl(140, 70%, 45%)" },
  { label: "Mystery Box", shortLabel: "Mystery", emoji: "📦", color: "hsl(270, 70%, 55%)" },
  { label: "FREE Neuro-Hacker Wristband", shortLabel: "Wristband", emoji: "🎁", color: "hsl(0, 85%, 55%)" },
  { label: "20 Blessed Coins", shortLabel: "20 BC", emoji: "🪙", color: "hsl(50, 85%, 50%)" },
  { label: "Free Shipping", shortLabel: "Shipping", emoji: "🚀", color: "hsl(200, 80%, 50%)" },
  { label: "FREE Neuro-Hacker Wristband", shortLabel: "Wristband", emoji: "🎁", color: "hsl(350, 90%, 50%)" },
];

// Always land on index 0 → "FREE Wristband"
const WINNING_INDEX = 0;
const SEGMENT_ANGLE = 360 / SEGMENTS.length;
const EXTRA_SPINS = 6; // Full rotations before landing

export function useSpinLogic(totalSpins: number = 1) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const maxSpins = Math.max(1, totalSpins);

  // Check localStorage on mount
  useEffect(() => {
    const claimed = localStorage.getItem(STORAGE_KEY);
    if (claimed) {
      setAlreadyClaimed(true);
    }
  }, []);

  // Auto-show wheel after delay (only for first-time visitors)
  useEffect(() => {
    if (alreadyClaimed) return;

    const timer = setTimeout(() => {
      setShowWheel(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [alreadyClaimed]);

  const spin = useCallback(() => {
    if (isSpinning || (hasWon && spinCount >= maxSpins)) return;

    // Reset hasWon for the next spin
    if (hasWon) setHasWon(false);

    setIsSpinning(true);

    const targetAngle = 360 - (WINNING_INDEX * SEGMENT_ANGLE + SEGMENT_ANGLE / 2);
    const jitter = (Math.random() - 0.5) * (SEGMENT_ANGLE * 0.6);
    // Use cumulative rotation so the wheel keeps spinning forward
    const baseRotation = (spinCount + 1) * EXTRA_SPINS * 360;
    const totalRotation = baseRotation + targetAngle + jitter;

    setRotation(totalRotation);

    const nextCount = spinCount + 1;

    setTimeout(() => {
      setIsSpinning(false);
      setHasWon(true);
      setSpinCount(nextCount);
      if (nextCount >= maxSpins) {
        localStorage.setItem(STORAGE_KEY, "true");
      }
    }, 4500);
  }, [isSpinning, hasWon, spinCount, maxSpins]);

  const allSpinsUsed = spinCount >= maxSpins && hasWon;
  const spinsRemaining = Math.max(0, maxSpins - spinCount);

  const openWheel = useCallback(() => {
    if (!alreadyClaimed) {
      setShowWheel(true);
    }
  }, [alreadyClaimed]);

  const closeWheel = useCallback(() => {
    if (!isSpinning) {
      setShowWheel(false);
    }
  }, [isSpinning]);

  return {
    segments: SEGMENTS,
    isSpinning,
    hasWon,
    showWheel,
    rotation,
    alreadyClaimed,
    allSpinsUsed,
    spinsRemaining,
    spinCount,
    maxSpins,
    spin,
    openWheel,
    closeWheel,
  };
}
