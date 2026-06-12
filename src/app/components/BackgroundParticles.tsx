import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  speedY: number;
  speedX: number;
  opacity: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export type ParticleMode = 'default' | 'stars' | 'snow' | 'hearts' | 'rain' | 'none';

export function BackgroundParticles({ isPlaying, mode }: { isPlaying: boolean, mode: ParticleMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode === 'none') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const particleCount = mode === 'stars' ? 100 : mode === 'snow' ? 80 : mode === 'hearts' ? 40 : mode === 'rain' ? 120 : 60;
    
    for (let i = 0; i < particleCount; i++) {
      let size = Math.random() * 0.8 + 0.4;
      if (mode === 'stars') size = Math.random() * 1.5 + 0.5;
      if (mode === 'snow') size = Math.random() * 2 + 1;
      if (mode === 'hearts') size = Math.random() * 1.2 + 0.8;
      if (mode === 'rain') size = Math.random() * 0.5 + 0.2;

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: size,
        baseSize: size,
        speedY: mode === 'snow' ? (Math.random() * 1 + 0.5) : mode === 'rain' ? (Math.random() * 10 + 15) : (Math.random() * 0.4 + 0.1),
        speedX: mode === 'snow' ? (Math.random() - 0.5) * 1 : mode === 'rain' ? (Math.random() * 2 + 2) : (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.4 + 0.1,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: mode === 'stars' ? Math.random() * 0.05 + 0.01 : Math.random() * 0.02 + 0.005,
      });
    }

    let simulatedBass = 0;
    let frameCount = 0;
    const beatInterval = 45;

    const render = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = mode === 'stars' ? 'rgba(13, 6, 23, 0.8)' : 'rgba(13, 6, 23, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'screen';
      frameCount++;

      if (isPlaying && mode !== 'stars') {
        if (frameCount % beatInterval === 0 || (frameCount % beatInterval === 15 && Math.random() > 0.6)) {
          simulatedBass = 1; 
        }
      }
      simulatedBass *= 0.88;

      particles.forEach((p) => {
        if (mode === 'default' || mode === 'hearts') {
          const currentSpeedY = isPlaying ? p.speedY * (1 + simulatedBass * 1.5) : p.speedY * 0.2;
          p.y -= currentSpeedY;
          if (mode === 'hearts') p.x += Math.sin(frameCount * 0.02 + p.pulsePhase) * 0.5;
          else p.x += p.speedX;
        } else if (mode === 'snow') {
          p.y += p.speedY;
          p.x += Math.sin(frameCount * 0.01 + p.pulsePhase) * 0.5 + p.speedX;
        } else if (mode === 'rain') {
          p.y += p.speedY;
          p.x -= p.speedX;
        } else if (mode === 'stars') {
          p.x -= p.speedX * 0.1;
        }

        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        p.pulsePhase += p.pulseSpeed;
        const pulse = Math.sin(p.pulsePhase) * 0.5 + 0.5;
        
        let dynamicSize = p.baseSize;
        let dynamicOpacity = p.opacity;

        if (mode === 'default') {
          dynamicSize = p.baseSize + (pulse * 0.5) + (simulatedBass * 1);
          dynamicOpacity = Math.min(p.opacity + (pulse * 0.2) + (simulatedBass * 0.4), 0.8);
        } else if (mode === 'hearts') {
          dynamicSize = p.baseSize + (simulatedBass * 0.5); // very subtle size change
          dynamicOpacity = p.opacity + 0.3; // static visibility without blinking
        } else if (mode === 'stars') {
          dynamicOpacity = pulse; // full pulse for twinkling
        } else if (mode === 'snow') {
          dynamicOpacity = p.opacity + 0.2;
        } else if (mode === 'rain') {
          dynamicOpacity = p.opacity + 0.1;
        }

        let glowRadius = dynamicSize * (isPlaying && (mode === 'default' || mode === 'hearts') ? (2 + simulatedBass * 1) : 1.5);
        
        if (mode === 'hearts') {
          glowRadius *= 2.5; // Make hearts larger overall
        }

        ctx.beginPath();
        if (mode === 'hearts') {
          const r = glowRadius * 0.5;
          ctx.moveTo(p.x, p.y - r * 0.3);
          ctx.bezierCurveTo(p.x + r * 0.8, p.y - r * 0.8, p.x + r * 1.8, p.y + r * 0.4, p.x, p.y + r * 1.5);
          ctx.bezierCurveTo(p.x - r * 1.8, p.y + r * 0.4, p.x - r * 0.8, p.y - r * 0.8, p.x, p.y - r * 0.3);
          
          // Solid fill for hearts, composite 'screen' makes it glow naturally
          ctx.fillStyle = `rgba(255, 105, 180, ${dynamicOpacity * 0.8})`;
          ctx.fill();
        } else if (mode === 'rain') {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.speedX * 1.5, p.y + p.speedY * 1.5);
          ctx.strokeStyle = `rgba(255, 255, 255, ${dynamicOpacity})`;
          ctx.lineWidth = dynamicSize;
          ctx.lineCap = 'round';
          ctx.stroke();
        } else {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${dynamicOpacity})`); 
          gradient.addColorStop(0.3, `rgba(255, 255, 255, ${dynamicOpacity * 0.3})`); 
          gradient.addColorStop(1, `rgba(255, 255, 255, 0)`); 
          ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, mode]);

  if (mode === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: mode === 'stars' ? 1 : 0.7 }}
    />
  );
}
