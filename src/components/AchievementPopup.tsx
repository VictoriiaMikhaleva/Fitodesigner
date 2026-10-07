import type { Achievement } from "../utils/gameProgress";
import { LevelClovers } from "./LevelClovers";

type AchievementPopupProps = {
  achievements: Achievement[];
  xpGained: number;
  leveledUp: boolean;
  level: number;
  levelTitle: string;
  onClose: () => void;
};

export function AchievementPopup({
  achievements,
  xpGained,
  leveledUp,
  level,
  levelTitle,
  onClose,
}: AchievementPopupProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-sage-900/30 p-4 backdrop-blur-sm">
      <div className="animate-pop-in card w-full max-w-md p-6 text-center sm:p-7">
        {leveledUp ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-500">
              Уровень пройден
            </p>
            <p className="mt-2 text-2xl font-semibold text-sage-800">{levelTitle}</p>
            <LevelClovers level={level} className="mt-5" />
            <p className="mt-4 text-sm text-sage-600">+{xpGained} XP за раунд</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-500">
              Раунд завершён
            </p>
            <p className="mt-2 text-2xl font-semibold text-sage-800">Практика завершена</p>
            <p className="mt-3 text-sage-700">+{xpGained} XP за раунд</p>

            {achievements.length > 0 && (
              <div className="mt-5 space-y-3 text-left">
                <p className="text-center text-sm font-semibold text-sage-600">Новые отметки</p>
                {achievements.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-sand-100 px-4 py-3">
                    <p className="font-semibold text-sage-800">{item.title}</p>
                    <p className="text-sm text-sage-600">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <button type="button" className="btn-primary mt-6 w-full" onClick={onClose}>
          Продолжить
        </button>
      </div>
    </div>
  );
}
