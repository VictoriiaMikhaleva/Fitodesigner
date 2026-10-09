import type { CatalogMode } from "../types";
import type { GameProgress } from "../utils/gameProgress";
import { GameHud } from "./GameHud";
import { LevelClovers } from "./LevelClovers";

type HomeScreenProps = {
  catalog: CatalogMode;
  plantsCount: number;
  progress: GameProgress;
  onStartTraining: () => void;
  onOpenCatalog: () => void;
};

const FEATURES = [
  "Реальные параметры растений из учебного каталога",
  "XP, уровни и достижения за каждую практику",
  "Разбор ошибок и рекомендации после проверки",
  "Три уровня сложности: новичок, практик, профи",
];

const STEPS = [
  "Выберите уровень и начните практику.",
  "Изучите условия и соберите подбор из каталога.",
  "Проверьте решение и получите XP, серию и достижения.",
  "Разберите ошибки и улучшите следующий раунд.",
];

export function HomeScreen({
  catalog,
  plantsCount,
  progress,
  onStartTraining,
  onOpenCatalog,
}: HomeScreenProps) {
  const catalogLabel = catalog === "garden" ? "Садовые растения" : "Комнатные растения";
  const lead =
    catalog === "garden"
      ? "Проходи практики, подбирай садовые растения под условия сада и учись принимать решения как профессиональный ландшафтный архитектор."
      : "Проходи практики, подбирай растения под условия помещения и учись принимать решения как профессиональный фитодизайнер.";
  const features =
    catalog === "garden"
      ? [
          "Все карточки садового каталога, включая разные окраски одной культуры",
          ...FEATURES.slice(1),
        ]
      : FEATURES;

  return (
    <div className="space-y-6">
      <GameHud progress={progress} />

      <section className="card overflow-hidden">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-8">
          <div>
            <p className="text-sm font-medium tracking-wide text-sage-500">{catalogLabel}</p>
            <h2 className="mt-2 text-4xl font-medium leading-tight text-sage-800 sm:text-5xl">
              Тренажёр насмотренности
            </h2>
            <p className="mt-3 text-lg text-sage-600">{catalogLabel}</p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-sage-700">{lead}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={onStartTraining}>
                Начать тренировку
              </button>
              <button type="button" className="btn-secondary" onClick={onOpenCatalog}>
                Открыть каталог
              </button>
            </div>
          </div>

          <div className="rounded-[22px] bg-sage-100 p-6">
            <p className="text-sm text-sage-500">Статистика практики</p>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <p className="text-3xl font-medium leading-none text-sage-800">{progress.roundsPlayed}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-sage-500">Практик пройдено</p>
              </div>
              <div>
                <p className="text-3xl font-medium leading-none text-sage-800">{plantsCount}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-sage-500">В каталоге</p>
              </div>
              <div>
                <p className="text-3xl font-medium leading-none text-sage-800">{progress.streak}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-sage-500">Серия</p>
              </div>
              <div>
                <p className="text-3xl font-medium leading-none text-sage-800">{progress.roundsPlayed}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-sage-500">Клеверы</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {progress.roundsPlayed > 0 && (
        <section className="card p-6">
          <h3 className="text-xl font-semibold text-sage-800">Ваши клеверы</h3>
          <p className="mt-1 text-sm text-sage-600">Один клевер за каждую завершённую практику.</p>
          <LevelClovers count={progress.roundsPlayed} className="mt-4 level-clovers--start" />
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card p-6">
          <h3 className="text-xl font-semibold text-sage-800">Как работает игра</h3>
          <ol className="mt-4 space-y-3">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-3 text-sage-700">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sm font-semibold text-sage-700">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className="card p-6">
          <h3 className="text-xl font-semibold text-sage-800">Почему это полезно</h3>
          <ul className="mt-4 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex gap-3 text-sage-700">
                <span className="text-sage-500">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
