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
    <header>
      <div className="bg-[#163C2D] text-[#FBF9F3]">
        <div className="mx-auto flex min-h-[69px] max-w-[1540px] flex-col justify-center gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <button type="button" onClick={onHome} className="text-left">
            <p className="text-[0.78rem] tracking-wide text-white/65">Подбор растений</p>
            <p className="text-[1.15rem] font-medium leading-tight">Тренажёр насмотренности</p>
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
      </div>

      {showHud && progress && (
        <div className="mx-auto max-w-[1540px] px-4 pt-5 sm:px-7">
          <GameHud progress={progress} compact />
        </div>
      )}
    </header>
  );
}
