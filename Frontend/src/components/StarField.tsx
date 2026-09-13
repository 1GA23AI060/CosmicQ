import { useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

export default function StarField() {
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 220 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() < 0.85 ? Math.random() * 1.4 + 0.4 : Math.random() * 2.4 + 1.4,
        opacity: Math.random() * 0.55 + 0.08,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 9,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ${star.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Nebula ambient glows */}
      <div
        className="absolute"
        style={{
          width: '65vw',
          height: '65vh',
          top: '-15%',
          right: '-8%',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 65%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="absolute"
        style={{
          width: '55vw',
          height: '55vh',
          bottom: '-8%',
          left: '-8%',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute"
        style={{
          width: '45vw',
          height: '45vh',
          top: '40%',
          left: '25%',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.03) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
}
