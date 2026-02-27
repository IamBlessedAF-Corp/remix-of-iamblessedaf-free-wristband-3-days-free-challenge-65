import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'circle' | 'rect' | 'star';
}

const COLORS = [
  '#FFD700', '#FF6B35', '#00D4AA', '#7C5CFF',
  '#FF3CAC', '#00F5D4', '#FEE440', '#FF006E',
];

function createParticle(canvasW: number, canvasH: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 4 + Math.random() * 8;
  return {
    x: canvasW / 2 + (Math.random() - 0.5) * 100,
    y: canvasH * 0.4,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    opacity: 1,
    shape: (['circle', 'rect', 'star'] as const)[Math.floor(Math.random() * 3)],
  };
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
}

export default function Confetti({ active, duration = 3000, particleCount = 80 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const elapsed = Date.now() - startTimeRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    for (const p of particlesRef.current) {
      if (p.opacity <= 0) continue;
      alive = true;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;

      if (elapsed > duration * 0.6) {
        p.opacity -= 0.02;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        // star
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const r = i === 0 ? p.size : p.size;
          ctx.lineTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5);
          const b = a + (2 * Math.PI) / 5;
          ctx.lineTo(Math.cos(b) * r * 0.2, Math.sin(b) * r * 0.2);
        }
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }

    if (alive) {
      animFrameRef.current = requestAnimationFrame(animate);
    }
  }, [duration]);

  useEffect(() => {
    if (!active) {
      particlesRef.current = [];
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(2, 2);

    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(canvas.offsetWidth, canvas.offsetHeight)
    );
    startTimeRef.current = Date.now();
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, particleCount, animate]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999, width: '100%', height: '100%' }}
    />
  );
}
