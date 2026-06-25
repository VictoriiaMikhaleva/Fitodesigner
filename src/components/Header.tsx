import type { GameProgress } from "../utils/gameProgress";
import { GameHud } from "./GameHud";

type HeaderProps = {
  onHome: () => void;
  onCatalog: () => void;
  progress?: GameProgress;
  showHud?: boolean;
};

const CHOOSE_CATALOG_URL =
  "https://victoriiamikhaleva.github.io/Choose_your_plant/plant_selector_catalog_v6_photos_lux_fixed.html";

export function Header({ onHome, onCatalog, progress, showHud = false }: HeaderProps) {
  return (
    <header className="space-y-3">
      <div className="card flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onHome} className="text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-500">Fitodesigner</p>
          <p className="text-lg font-semibold text-sage-800">Фитодизайнер</p>
        </button>

        <nav className="flex flex-wrap items-center gap-5 sm:gap-6" aria-label="Навигация">
          <button type="button" className="site-nav-link" onClick={onHome}>
            На главную
          </button>
          <button type="button" className="site-nav-link" onClick={onCatalog}>
            Каталог тренажёра
          </button>
          <a className="site-nav-link" href={CHOOSE_CATALOG_URL}>
            Подбор растений
          </a>
        </nav>
      </div>

      {showHud && progress && <GameHud progress={progress} compact />}
    </header>
  );
}
