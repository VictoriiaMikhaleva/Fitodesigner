import { getLevelTitle, getXpProgress, type GameProgress } from "../utils/gameProgress";

type GameHudProps = {
  progress: GameProgress;
  compact?: boolean;
};

export function GameHud({ progress, compact = false }: GameHudProps) {
  const xp = getXpProgress(progress);

  return (
    <section
      className={compact ? "" : "rounded-[22px] border border-sage-800/10 bg-sage-50 px-4 py-4 sm:px-5"}
      aria-label="Прогресс"
    >
      <p className="text-[0.68rem] font-medium tracking-[0.16em] text-sage-500">ПРОГРЕСС</p>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-0">
        <div className="sm:pr-6">
          <p className="text-xs text-sage-500">Уровень {progress.level}</p>
          <p className="mt-0.5 text-sm font-medium text-sage-800">{getLevelTitle(progress.level)}</p>
        </div>

        <div className="min-w-0 flex-1 border-t border-sage-800/10 pt-4 sm:border-t-0 sm:border-l sm:px-6 sm:pt-0">
          <div className="mb-2 flex items-baseline justify-between gap-4 text-xs text-sage-600">
            <span>XP</span>
            <span className="tabular-nums">
              {xp.current} / {xp.max}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-sage-200">
            <div className="h-full rounded-full bg-sage-600" style={{ width: `${xp.percent}%` }} />
          </div>
        </div>

        <div className="flex gap-6 border-t border-sage-800/10 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
          <div>
            <p className="text-xs text-sage-500">Серия</p>
            <p className="mt-0.5 text-sm font-medium tabular-nums text-sage-800">{progress.streak}</p>
          </div>
          {!compact && (
            <div>
              <p className="text-xs text-sage-500">Рекорд</p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-sage-800">{progress.bestScore}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
