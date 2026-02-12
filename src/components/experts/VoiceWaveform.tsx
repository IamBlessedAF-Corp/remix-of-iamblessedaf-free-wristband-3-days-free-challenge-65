import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface VoiceWaveformProps {
  isActive: boolean;
  isSpeaking: boolean;
  getInputVolume?: () => number;
  getOutputVolume?: () => number;
}

const BAR_COUNT = 24;

const VoiceWaveform = ({ isActive, isSpeaking, getInputVolume, getOutputVolume }: VoiceWaveformProps) => {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) return;

    const animate = () => {
      const inputVol = getInputVolume?.() ?? 0;
      const outputVol = getOutputVolume?.() ?? 0;
      const vol = Math.max(inputVol, outputVol);

      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        // Create wave pattern with volume influence
        const phase = (Date.now() / 120 + i * 15) % 360;
        const sinVal = Math.sin((phase * Math.PI) / 180);
        const base = isSpeaking ? 0.3 : 0.1;
        const amplitude = Math.max(vol * 2, base);
        const height = Math.max(4, Math.abs(sinVal) * amplitude * 32 + 4);
        bar.style.height = `${height}px`;
        bar.style.opacity = `${Math.max(0.3, amplitude)}`;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive, isSpeaking, getInputVolume, getOutputVolume]);

  if (!isActive) return null;

  return (
    <motion.div
      className="flex items-center justify-center gap-[2px] h-8 px-3"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { barsRef.current[i] = el; }}
          className={`w-[3px] rounded-full transition-colors duration-200 ${
            isSpeaking ? "bg-primary" : "bg-primary/50"
          }`}
          style={{ height: 4 }}
        />
      ))}
    </motion.div>
  );
};

export default VoiceWaveform;
