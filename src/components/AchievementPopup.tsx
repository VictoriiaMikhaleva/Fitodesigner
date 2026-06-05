import type { Achievement } from "../utils/gameProgress";

type AchievementPopupProps = {
  achievements: Achievement[];
  xpGained: number;
  leveledUp: boolean;
  levelTitle: string;
  onClose: () => void;
};

export function AchievementPopup({
  achievements,
  xpGained,
  leveledUp,
  levelTitle,
  onClose,
}: AchievementPopupProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-sage-900/30 p-4 backdrop-blur-sm">
      <div className="animate-pop-in card max-w-md p-6 text-center">
        {leveledUp ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-500">Новый уровень</p>
            <p className="mt-2 text-2xl font-semibold text-sage-800">{levelTitle}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-500">Раунд завершён</p>
            <p className="mt-2 text-2xl font-semibold text-sage-800">Отличная работа!</p>
          </>
        )}

        <p className="mt-3 text-sage-700">+{xpGained} XP за раунд</p>

        {achievements.length > 0 && (
          <div className="mt-5 space-y-3 text-left">
            <p className="text-center text-sm font-semibold text-sage-600">Новые достижения</p>
            {achievements.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-2xl bg-sand-100 p-3">
                <span className="text-2xl" aria-hidden="true">
                  {item.icon}
                </span>
                <div>
                  <p className="font-semibold text-sage-800">{item.title}</p>
                  <p className="text-sm text-sage-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="button" className="btn-primary mt-6 w-full" onClick={onClose}>
          Продолжить
        </button>
      </div>
    </div>
  );
}
