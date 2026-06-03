import React, { useEffect, useRef } from 'react';

interface Particle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  color: string;
  size: number;
}

export const InteractiveLiquidBackground: React.FC<{ theme?: string }> = ({ theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glow1Ref = useRef<HTMLDivElement>(null);
  const glow2Ref = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  const getParticleColor = (hue: number, currentTheme: string) => {
    if (currentTheme === 'light') {
      return `hsla(${hue}, 80%, 42%, 0.85)`;
    } else {
      return `hsla(${hue}, 95%, 62%, 0.9)`;
    }
  };

  // Dynamically update colors when theme changes
  useEffect(() => {
    particlesRef.current.forEach(p => {
      p.color = getParticleColor(p.hue, theme);
    });
  }, [theme]);

  useEffect(() => {
    if (!canvasRef.current || !glow1Ref.current || !glow2Ref.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const glow1 = glow1Ref.current;
    const glow2 = glow2Ref.current;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let centerX = width / 2;
    let centerY = height / 2;

    const particles: Particle[] = [];
    particlesRef.current = particles;

    let mx = width / 2;
    let my = height / 2;
    const mouse = {
      x: width / 2,
      y: height / 2,
      active: false,
    };

    let isMouseDown = false;

    const ringCount = 24;
    let maxRadius = Math.min(width, height) * 0.45;

    const createParticles = () => {
      particles.length = 0;
      for (let ring = 1; ring <= ringCount; ring++) {
        const radius = (ring / ringCount) * maxRadius;
        const count = Math.floor(radius * 1.3);

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
            hue,
            color: getParticleColor(hue, theme),
            size: 1.0 + (ring / ringCount) * 1.5,
          });
        }
      }
    };

    createParticles();

    // Event handlers
    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleMouseDown = () => {
      isMouseDown = true;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mx = e.touches[0].clientX;
        my = e.touches[0].clientY;
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      mouse.active = true;
      isMouseDown = true;
      if (e.touches.length > 0) {
        mx = e.touches[0].clientX;
        my = e.touches[0].clientY;
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      mouse.active = false;
      isMouseDown = false;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      centerX = width / 2;
      centerY = height / 2;
      maxRadius = Math.min(width, height) * 0.45;

      createParticles();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', handleResize);

    const SPRING = 0.018;
    const DAMPING = 0.93;
    const FORCE_RADIUS = 200;
    const FORCE_STRENGTH = 6;

    let frame = 0;
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      frame++;

      // Update ambient glows
      glow1.style.transform = `translate(${mx - 300}px, ${my - 300}px)`;
      glow2.style.transform = `translate(${width - mx - 300}px, ${height - my - 300}px)`;

      ctx.clearRect(0, 0, width, height);

      const forceStrength = isMouseDown ? FORCE_STRENGTH * 2.5 : FORCE_STRENGTH;
      const forceRadius = isMouseDown ? FORCE_RADIUS * 1.5 : FORCE_RADIUS;

      for (const p of particles) {
        const dxHome = p.baseX - p.x;
        const dyHome = p.baseY - p.y;

        p.vx += dxHome * SPRING;
        p.vy += dyHome * SPRING;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < forceRadius) {
            const force = ((forceRadius - dist) / forceRadius) * forceStrength;
            const angle = Math.atan2(dy, dx);

            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }
        }

        const cx = p.x - centerX;
        const cy = p.y - centerY;
        const swirl = Math.sin(frame * 0.01 + Math.atan2(cy, cx)) * 0.04;

        p.vx += -cy * swirl * 0.0003;
        p.vy += cx * swirl * 0.0003;

        p.vx *= DAMPING;
        p.vy *= DAMPING;

        p.x += p.vx;
        p.y += p.vy;

        // Visual properties
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const dxCenter = p.x - centerX;
        const dyCenter = p.y - centerY;
        const tangentAngle = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;

        let angle;
        if (speed > 0.15) {
          const velocityAngle = Math.atan2(p.vy, p.vx);
          const t = Math.min((speed - 0.15) / 2, 1);
          // Interpolate angle for smooth tangent transition
          angle = tangentAngle + t * (velocityAngle - tangentAngle);
        } else {
          angle = tangentAngle;
        }

        const length = Math.min(speed * 3.5, 9);
        const w = length + p.size * 2.2;
        const h = p.size;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.fillStyle = p.color;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
        } else {
          ctx.rect(-w / 2, -h / 2, w, h);
        }
        ctx.fill();
        ctx.restore();
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const themeClass = theme === 'light' ? 'light' : 'dark';

  return (
    <div ref={containerRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      zIndex: 0,
      pointerEvents: 'none',
      background: 'transparent'
    }}>
      <style>{`
        .glow {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(120px);
          transition: transform 0.08s linear, opacity 0.5s ease;
          will-change: transform;
        }

        .glow.dark {
          opacity: 0.35;
          mix-blend-mode: screen;
        }
        .glow.dark.glow1 {
          background: radial-gradient(circle, rgba(99, 102, 241, 0.8), transparent 70%);
        }
        .glow.dark.glow2 {
          background: radial-gradient(circle, rgba(168, 85, 247, 0.7), transparent 70%);
        }

        .glow.light {
          opacity: 0.15;
          mix-blend-mode: multiply;
        }
        .glow.light.glow1 {
          background: radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent 70%);
        }
        .glow.light.glow2 {
          background: radial-gradient(circle, rgba(168, 85, 247, 0.35), transparent 70%);
        }
      `}</style>
      <div ref={glow1Ref} className={`glow glow1 ${themeClass}`} />
      <div ref={glow2Ref} className={`glow glow2 ${themeClass}`} />
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
};
