import { useEffect, useRef } from 'react';

const COLORS = ['#fcd34d', '#67e8f9', '#f0abfc', '#86efac', '#fb923c'];
const LAUNCHES = [
  { at: 150, x: 0.15, y: 0.26 },
  { at: 800, x: 0.85, y: 0.32 },
  { at: 1550, x: 0.32, y: 0.16 },
  { at: 2300, x: 0.72, y: 0.2 },
  { at: 3100, x: 0.1, y: 0.5 },
  { at: 3900, x: 0.9, y: 0.48 },
  { at: 4600, x: 0.25, y: 0.25 },
  { at: 5100, x: 0.77, y: 0.3 },
];

export default function TournamentFireworks({ lightweight = false, allowReducedMotion = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!context || (motion.matches && !allowReducedMotion)) return;
    let width = 0;
    let height = 0;
    let frame;
    let particles = [];
    const exploded = new Set();
    const started = performance.now();
    let previous = started;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, lightweight ? 1 : 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      context.clearRect(0, 0, width, height);
    };
    const animate = (now) => {
      const elapsed = now - started;
      const delta = Math.min((now - previous) / 1000, 0.04);
      previous = now;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      LAUNCHES.forEach((launch, index) => {
        const progress = (elapsed - launch.at) / 750;
        if (progress < 0) return;
        const x = launch.x * width;
        const y = launch.y * height;
        const color = COLORS[index % COLORS.length];
        if (progress < 1) {
          const rocketY = height - ((height - y) * (1 - ((1 - progress) ** 2)));
          const trail = context.createLinearGradient(x, rocketY, x, rocketY + 70);
          trail.addColorStop(0, color);
          trail.addColorStop(1, 'transparent');
          context.globalAlpha = 1;
          context.fillStyle = trail;
          context.fillRect(x - 1, rocketY, 2, 70);
          context.beginPath();
          context.arc(x, rocketY, 2.5, 0, Math.PI * 2);
          context.fillStyle = '#fff7d6';
          context.fill();
        } else if (!exploded.has(index)) {
          exploded.add(index);
          const speed = Math.min(width, height) * 0.24;
          const sparkCount = lightweight ? 32 : 64;
          for (let spark = 0; spark < sparkCount; spark += 1) {
            const angle = (Math.PI * 2 * spark) / sparkCount;
            const velocity = speed * (0.5 + Math.random() * 0.7);
            particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, age: 0, life: 1.1 + Math.random() * 0.7, color });
          }
        }
      });

      particles = particles.filter((particle) => particle.age < particle.life);
      particles.forEach((particle) => {
        const lastX = particle.x;
        const lastY = particle.y;
        particle.age += delta;
        particle.vx *= Math.exp(-0.85 * delta);
        particle.vy += 60 * delta;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        context.globalAlpha = Math.max(0, 1 - particle.age / particle.life);
        context.strokeStyle = particle.color;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(particle.x, particle.y);
        context.stroke();
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, 1.6, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
      if (elapsed < 8000) frame = requestAnimationFrame(animate);
      else stop();
    };

    resize();
    frame = requestAnimationFrame(animate);
    window.addEventListener('resize', resize);
    const onMotionChange = () => { if (motion.matches && !allowReducedMotion) stop(); };
    motion.addEventListener('change', onMotionChange);
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      motion.removeEventListener('change', onMotionChange);
    };
  }, [lightweight, allowReducedMotion]);

  return <canvas ref={canvasRef} aria-hidden="true" data-tournament-fireworks className="pointer-events-none absolute inset-0 h-full w-full" />;
}
