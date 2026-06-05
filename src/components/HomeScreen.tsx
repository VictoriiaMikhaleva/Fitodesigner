type HomeScreenProps = {
  plantsCount: number;
  onStartTraining: () => void;
  onOpenCatalog: () => void;
};

const FEATURES = [
  "Реальные параметры растений из учебного каталога",
  "Тренировка подбора под интерьер и бриф клиента",
  "Разбор ошибок и рекомендации после проверки",
  "Три уровня сложности: новичок, практик, профи",
];

const STEPS = [
  "Получите бриф с условиями помещения.",
  "Изучите свет, влажность, температуру и требования клиента.",
  "Соберите подбор в каталоге и проверьте решение.",
  "Разберите баллы, риски и рекомендации по каждому растению.",
];

export function HomeScreen({ plantsCount, onStartTraining, onOpenCatalog }: HomeScreenProps) {
  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sage-500">Fitodesigner</p>
            <h2 className="mt-2 text-4xl font-semibold leading-tight text-sage-800 sm:text-5xl">Фитодизайнер</h2>
            <p className="mt-3 text-lg text-sage-600">
              Обучающий тренажёр по подбору растений для интерьера
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-sage-700">
              Получай брифы, подбирай растения под условия помещения и учись принимать решения как
              профессиональный фитодизайнер.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={onStartTraining}>
                Начать тренировку
              </button>
              <button type="button" className="btn-secondary" onClick={onOpenCatalog}>
                Открыть каталог
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-sage-100 via-sand-100 to-sage-200 p-6">
            <p className="text-sm font-medium text-sage-600">Каталог</p>
            <p className="mt-2 text-4xl font-semibold text-sage-800">{plantsCount}</p>
            <p className="mt-2 text-sm text-sage-600">растений готово к тренировке</p>
            <div className="mt-6 rounded-2xl bg-white/70 p-4 text-sm text-sage-700">
              Excel используется только как источник для генерации JSON. Приложение работает с
              `plants.json`.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card p-6">
          <h3 className="text-xl font-semibold text-sage-800">Как работает тренажёр</h3>
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
            {FEATURES.map((feature) => (
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
