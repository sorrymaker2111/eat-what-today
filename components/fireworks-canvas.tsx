"use client";

import { useEffect, useRef } from "react";

type Firework = {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  hue: number;
  trail: Array<{ x: number; y: number; alpha: number }>;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  alpha: number;
  radius: number;
};

type FireworksCanvasProps = {
  active: boolean;
};

export function FireworksCanvas({ active }: FireworksCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    let frameId = 0;
    let launchTimer = 0;
    const fireworks: Firework[] = [];
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      context.globalCompositeOperation = "lighter";
    };

    const launch = () => {
      const fromLeft = Math.random() > 0.5;
      const startX = fromLeft ? window.innerWidth * 0.12 : window.innerWidth * 0.88;
      const targetX = startX + (Math.random() - 0.5) * window.innerWidth * 0.22;
      const targetY = window.innerHeight * (0.2 + Math.random() * 0.42);

      fireworks.push({
        x: startX,
        y: window.innerHeight + 20,
        targetY,
        vx: (targetX - startX) * 0.018,
        vy: -7 - Math.random() * 2,
        hue: Math.random() * 360,
        trail: []
      });
    };

    const burst = (firework: Firework) => {
      for (let i = 0; i < 56; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.4 + Math.random() * 4.2;
        particles.push({
          x: firework.x,
          y: firework.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          hue: firework.hue + Math.random() * 40 - 20,
          alpha: 1,
          radius: 1.4 + Math.random() * 2.4
        });
      }
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      fireworks.forEach((firework, index) => {
        firework.trail.push({ x: firework.x, y: firework.y, alpha: 1 });
        if (firework.trail.length > 7) {
          firework.trail.shift();
        }

        firework.x += firework.vx;
        firework.y += firework.vy;
        firework.vy += 0.08;

        firework.trail.forEach((point, pointIndex) => {
          context.beginPath();
          context.arc(point.x, point.y, 2, 0, Math.PI * 2);
          context.fillStyle = `hsla(${firework.hue}, 100%, 72%, ${(pointIndex + 1) / firework.trail.length})`;
          context.fill();
        });

        context.beginPath();
        context.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
        context.fillStyle = `hsl(${firework.hue}, 100%, 66%)`;
        context.fill();

        if (firework.y <= firework.targetY || firework.vy >= 0) {
          burst(firework);
          fireworks.splice(index, 1);
        }
      });

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.985;
        particle.vy = particle.vy * 0.985 + 0.045;
        particle.alpha -= 0.017;
        particle.radius *= 0.985;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `hsla(${particle.hue}, 96%, 64%, ${Math.max(particle.alpha, 0)})`;
        context.fill();

        if (particle.alpha <= 0 || particle.radius <= 0.2) {
          particles.splice(index, 1);
        }
      });

      frameId = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 4; i += 1) {
      window.setTimeout(launch, i * 180);
    }
    launchTimer = window.setInterval(launch, 540);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.clearInterval(launchTimer);
      window.cancelAnimationFrame(frameId);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  if (!active) {
    return null;
  }

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-40 h-full w-full" aria-hidden="true" />;
}
