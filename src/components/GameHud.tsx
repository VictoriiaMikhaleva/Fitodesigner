import { getLevelTitle, getXpProgress, type GameProgress } from "../utils/gameProgress";

type GameHudProps = {
  progress: GameProgress;
  compact?: boolean;
};

export function GameHud({ progress, compact = false }: GameHudProps) {
  const xp = getXpProgress(progress);

  return (
    <div className={`flex flex-wrap items-center gap-3 ${compact ? "" : "rounded-2xl border border-sage-200 bg-sage-50/80 p-3"}`}>
      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
        <span className="text-lg" aria-hidden="true">⭐</span>
        <div>
          <p className="text-xs text-sage-500">Уровень {progress.level}</p>
          <p className="text-sm font-semibold text-sage-800">{getLevelTitle(progress.level)}</p>
        </div>
      </div>

      <div className="min-w-[140px] flex-1">
        <div className="mb-1 flex justify-between text-xs text-sage-600">
          <span>XP</span>
          <span>
            {xp.current}/{xp.max}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sage-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sage-400 to-sage-600 transition-all duration-700"
            style={{ width: `${xp.percent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
        <span aria-hidden="true">🔥</span>
        <div>
          <p className="text-xs text-sage-500">Серия</p>
          <p className="text-sm font-semibold text-sage-800">{progress.streak}</p>
        </div>
      </div>

      {!compact && (
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
          <span aria-hidden="true">🏅</span>
          <div>
            <p className="text-xs text-sage-500">Рекорд</p>
            <p className="text-sm font-semibold text-sage-800">{progress.bestScore}</p>
          </div>
        </div>
      )}
    </div>
  );
}
