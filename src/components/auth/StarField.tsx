/**
 * Twinkling stars plus periodic shooting stars, all CSS-driven.
 *
 * Positions come from a seeded generator rather than Math.random so the server
 * and client render identical markup (no hydration mismatch).
 */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seeded(42);
const STARS = Array.from({ length: 70 }, () => ({
  top: rand() * 100,
  left: rand() * 100,
  size: rand() < 0.85 ? 1 + rand() : 2 + rand() * 1.5,
  delay: rand() * 6,
  duration: 2.5 + rand() * 4,
}));

const SHOOTING = [
  { top: 8, left: 55, delay: 0, duration: 7 },
  { top: 22, left: 85, delay: 2.4, duration: 9 },
  { top: 4, left: 30, delay: 4.8, duration: 8 },
  { top: 38, left: 95, delay: 6.5, duration: 10 },
  { top: 15, left: 70, delay: 9, duration: 11 },
];

export default function StarField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="lb-star absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: s.size > 2 ? "0 0 6px 1px rgba(255, 180, 162,0.8)" : undefined,
          }}
        />
      ))}
      {SHOOTING.map((s, i) => (
        <span
          key={`shoot-${i}`}
          className="lb-shooting-star absolute"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
