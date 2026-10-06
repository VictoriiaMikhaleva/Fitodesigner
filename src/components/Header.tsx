import type { GameProgress } from "../utils/gameProgress";
import { PLANT_ROUTES } from "../config/routes";
import { GameHud } from "./GameHud";

type HeaderProps = {
  onHome: () => void;
  onCatalog: () => void;
  progress?: GameProgress;
  showHud?: boolean;
};

const cloverSrc = `${import.meta.env.BASE_URL}brand/clover-four-leaf.png`;

export function Header({ onHome, onCatalog, progress, showHud = false }: HeaderProps) {
  return (
    <header>
      <div className="bg-[#163C2D] text-[#FBF9F3]">
        <div className="mx-auto flex max-w-[1540px] flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <button type="button" onClick={onHome} className="flex min-w-0 items-center gap-2.5 text-left">
            <img className="brand-mark" src={cloverSrc} alt="" width={784} height={944} />
            <span className="min-w-0">
              <p className="truncate text-[0.78rem] tracking-wide text-white/65">Подбор растений</p>
              <p className="truncate text-[1.15rem] font-medium leading-tight">Тренажёр насмотренности</p>
            </span>
          </button>

          <nav className="product-nav" aria-label="Разделы продукта">
            <a className="site-nav-link" href={PLANT_ROUTES.home}>
              На главную
            </a>
            <a className="site-nav-link" href={PLANT_ROUTES.indoor}>
              Комнатные растения
            </a>
            <a className="site-nav-link" href={PLANT_ROUTES.garden}>
              Садовые растения
            </a>
            <a className="site-nav-link site-nav-link--current" href={PLANT_ROUTES.trainer} aria-current="page">
              Тренажёр
            </a>
            <button type="button" className="site-nav-link" onClick={onCatalog}>
              Каталог тренажёра
            </button>
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
