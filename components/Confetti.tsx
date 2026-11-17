'use client';
import { useEffect, useRef } from 'react';

const COLORS = ['#d4af37', '#f3d98a', '#fff1c1', '#b8892b', '#d01f2f', '#ffffff'];

/** Chuva de confete dourado. Muda o `burst` para disparar de novo. */
export function Confetti({ burst, count = 160, duration = 4500 }: { burst: number; count?: number; duration?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!burst) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width;
    const H = () => canvas.height;
    const parts = Array.from({ length: count }, () => ({
      x: W() / 2 + (Math.random() - 0.5) * W() * 0.3,
      y: H() * 0.45,
      vx: (Math.random() - 0.5) * 22 * dpr,
      vy: (-Math.random() * 20 - 8) * dpr,
      w: (6 + Math.random() * 7) * dpr,
      h: (3 + Math.random() * 5) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tilt: Math.random() * 10,
    }));

    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = t - start;
      ctx.clearRect(0, 0, W(), H());
      const fade = Math.max(0, 1 - Math.max(0, elapsed - duration + 1200) / 1200);
      for (const p of parts) {
        p.vy += 0.45 * dpr;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.tilt += 0.1;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.tilt));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (elapsed < duration) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W(), H());
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, W(), H());
    };
  }, [burst, count, duration]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 50 }}
    />
  );
}
