import type { GameProgress } from "../utils/gameProgress";
import { GameHud } from "./GameHud";

type HeaderProps = {
  onHome: () => void;
  onCatalog: () => void;
  progress?: GameProgress;
  showHud?: boolean;
};

const CHOOSE_PLANT_URL = "https://victoriiamikhaleva.github.io/Choose_your_plant/";

export function Header({ onHome, onCatalog, progress, showHud = false }: HeaderProps) {
  return (
    <header className="space-y-3">
      <div className="card flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-left">
          <button type="button" onClick={onHome} className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-500">Fitodesigner</p>
            <h1 className="text-2xl font-semibold text-sage-800">Фитодизайнер</h1>
          </button>
          <p className="mt-1 text-sm text-sage-600">
            Обучающий тренажёр по подбору растений для интерьера ·{" "}
            <a
              href={CHOOSE_PLANT_URL}
              className="text-sage-500 underline-offset-2 hover:text-sage-700 hover:underline"
            >
              подбор для клиента
            </a>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={onCatalog}>
            Открыть каталог
          </button>
          <button type="button" className="btn-secondary" onClick={onHome}>
            На главный экран
          </button>
        </div>
      </div>

      {showHud && progress && <GameHud progress={progress} compact />}
    </header>
  );
}
