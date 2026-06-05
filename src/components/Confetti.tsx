const COLORS = ["#6f9462", "#b4cfa4", "#e6d9c8", "#56764b", "#f2ebe1"];

export function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 36 }, (_, index) => (
        <span
          key={index}
          className="confetti-piece absolute block h-3 w-2 rounded-sm"
          style={{
            left: `${(index * 97) % 100}%`,
            backgroundColor: COLORS[index % COLORS.length],
            animationDelay: `${(index % 8) * 0.08}s`,
            animationDuration: `${1.4 + (index % 5) * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}
