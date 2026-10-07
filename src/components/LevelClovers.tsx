type LevelCloversProps = {
  level: number;
  className?: string;
};

const cloverSrc = `${import.meta.env.BASE_URL}brand/clover-four-leaf.png`;

/** Visual mastery marks: one branded clover per reached level. No storage / no new rewards. */
export function LevelClovers({ level, className = "" }: LevelCloversProps) {
  const count = Math.max(1, Math.floor(level));

  return (
    <ul
      className={`level-clovers ${className}`.trim()}
      aria-label={`${count} ${count === 1 ? "клевер" : count < 5 ? "клевера" : "клеверов"} — уровень ${count}`}
    >
      {Array.from({ length: count }, (_, index) => (
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
