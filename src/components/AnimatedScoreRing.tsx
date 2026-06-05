import { useEffect, useState } from "react";

type AnimatedScoreRingProps = {
  score: number;
  level: string;
};

function ringColor(score: number): string {
  if (score >= 90) return "#4f7a49";
  if (score >= 70) return "#6f9462";
  if (score >= 50) return "#c49a3a";
  return "#c86d52";
}

export function AnimatedScoreRing({ score, level }: AnimatedScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;

  useEffect(() => {
    let frame = 0;
    const duration = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.min(score, Math.round((elapsed / duration) * score));
      setDisplayScore(next);
      if (elapsed < duration) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-36 w-36 items-center justify-center">
        <svg className="-rotate-90" width="144" height="144" viewBox="0 0 144 144" aria-hidden="true">
          <circle cx="72" cy="72" r={radius} fill="none" stroke="#d2e3c8" strokeWidth="10" />
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke={ringColor(score)}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-3xl font-bold text-sage-800">{displayScore}</p>
          <p className="text-xs text-sage-500">из 100</p>
        </div>
      </div>
      <p className="text-center text-lg font-semibold text-sage-800">{level}</p>
    </div>
  );
}
