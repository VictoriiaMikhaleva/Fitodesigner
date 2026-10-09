import { LevelClovers } from "./LevelClovers";

type AchievementPopupProps = {
  roundsPlayed: number;
  xpGained: number;
  onClose: () => void;
};

export function AchievementPopup({ roundsPlayed, xpGained, onClose }: AchievementPopupProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-sage-900/30 p-4 backdrop-blur-sm">
      <div className="animate-pop-in card w-full max-w-md p-6 text-center sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sage-500">
          Раунд завершён
        </p>
        <p className="mt-2 text-2xl font-semibold text-sage-800">Практика завершена</p>
        <LevelClovers count={roundsPlayed} className="mt-5" />
        <p className="mt-4 text-sm text-sage-600">+{xpGained} XP за раунд</p>

        <button type="button" className="btn-primary mt-6 w-full" onClick={onClose}>
          Продолжить
        </button>
      </div>
    </div>
  );
}
