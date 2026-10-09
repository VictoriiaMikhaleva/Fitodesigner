type LevelCloversProps = {
  count: number;
  className?: string;
};

const cloverSrc = `${import.meta.env.BASE_URL}brand/clover-four-leaf.png`;

function cloverWord(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return "клевер";
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) return "клевера";
  return "клеверов";
}

/** One branded clover per completed practice. No emoji, no extra badges. */
export function LevelClovers({ count, className = "" }: LevelCloversProps) {
  const marks = Math.max(0, Math.floor(count));
  if (marks === 0) return null;

  return (
    <ul
      className={`level-clovers ${className}`.trim()}
      aria-label={`${marks} ${cloverWord(marks)} за ${marks} ${marks === 1 ? "практику" : "практики"}`}
    >
      {Array.from({ length: marks }, (_, index) => (
        <li key={index} className="level-clovers__item">
          <img
            className="level-clovers__mark"
            src={cloverSrc}
            alt=""
            width={784}
            height={944}
            decoding="async"
          />
        </li>
      ))}
    </ul>
  );
}
