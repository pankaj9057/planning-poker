import React, { useEffect, useRef } from "react";

type Particle = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
};

export default function GoogleAntiGravityBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;

    const particles: Particle[] = [];

    const mouse = {
      x: width / 2,
      y: height / 2,
      active: false,
    };

    const ringCount = 22;
    const maxRadius = Math.min(width, height) * 0.42;

    function createParticles() {
      particles.length = 0;

      for (let ring = 1; ring <= ringCount; ring++) {
        const radius = (ring / ringCount) * maxRadius;

        const count = Math.floor(radius * 1.2);

        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;

          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          const hue = 30 + (angle / (Math.PI * 2)) * 220;

          particles.push({
            baseX: x,
            baseY: y,
            x,
            y,
            vx: 0,
            vy: 0,
            color: `hsl(${hue},90%,55%)`,
            size: 1 + ring / ringCount,
          });
        }
      }
    }

    createParticles();

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width;
      canvas.height = height;

      createParticles();
    };

    window.addEventListener("resize", resize);

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    window.addEventListener("mouseleave", () => {
      mouse.active = false;
    });

    canvas.addEventListener(
      "touchmove",
      (e) => {
        const touch = e.touches[0];

        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
        mouse.active = true;
      },
      { passive: true }
    );

    const SPRING = 0.025;
    const DAMPING = 0.92;
    const FORCE_RADIUS = 220;
    const FORCE_STRENGTH = 9;

    let frame = 0;

    function animate() {
      frame++;

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#f8f8f8";
      ctx.fillRect(0, 0, width, height);

      for (const p of particles) {
        const dxHome = p.baseX - p.x;
        const dyHome = p.baseY - p.y;

        p.vx += dxHome * SPRING;
        p.vy += dyHome * SPRING;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;

          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < FORCE_RADIUS) {
            const force =
              ((FORCE_RADIUS - dist) / FORCE_RADIUS) * FORCE_STRENGTH;

            const angle = Math.atan2(dy, dx);

            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }
        }

        const cx = p.x - centerX;
        const cy = p.y - centerY;

        const swirl =
          Math.sin(frame * 0.01 + Math.atan2(cy, cx)) * 0.04;

        p.vx += -cy * swirl * 0.0003;
        p.vy += cx * swirl * 0.0003;

        p.vx *= DAMPING;
        p.vy *= DAMPING;

        p.x += p.vx;
        p.y += p.vy;

        const angle = Math.atan2(p.vy, p.vx);
        const length = Math.min(
          Math.sqrt(p.vx * p.vx + p.vy * p.vy) * 3,
          8
        );

        ctx.save();

        ctx.translate(p.x, p.y);
        ctx.rotate(angle);

        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.roundRect(
          -length / 2,
          -p.size / 2,
          length + p.size,
          p.size + 1,
          2
        );
        ctx.fill();

        ctx.restore();
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
    />
  );
}