import type { Plant } from "../types";

type PlantCardProps = {
  plant: Plant;
  selected?: boolean;
  disabled?: boolean;
  onToggle?: (plant: Plant) => void;
  showDetails?: boolean;
};

function petLabel(plant: Plant): string {
  if (plant.petSafe === true) return "Безопасно для животных";
  if (plant.petSafe === false) return plant.toxicity || "Опасно для животных";
  return "Безопасность не указана";
}

export function PlantCard({
  plant,
  selected = false,
  disabled = false,
  onToggle,
  showDetails = true,
}: PlantCardProps) {
  const interactive = Boolean(onToggle);
  const Tag = interactive ? "button" : "article";

  return (
    <Tag
      type={interactive ? "button" : undefined}
      disabled={interactive ? disabled : undefined}
      onClick={interactive ? () => onToggle?.(plant) : undefined}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-sage-500 bg-sage-50 shadow-[0_0_0_2px_rgba(111,148,98,0.15)] animate-pop-in"
          : "border-sage-200 bg-white hover:border-sage-300 hover:-translate-y-0.5"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sage-100 to-sand-100 text-3xl">
          {plant.imageUrl ? (
            <img src={plant.imageUrl} alt={plant.nameRu} className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true">🌿</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-sage-800">{plant.nameRu}</h3>
              <p className="text-sm italic text-sage-500">{plant.nameLat}</p>
            </div>
            {selected && (
              <span className="rounded-full bg-sage-600 px-2.5 py-1 text-xs font-medium text-white">
                В подборе
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-sage-600">{plant.category || "Категория не указана"}</p>

          {showDetails && (
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-sage-500">Свет</dt>
                <dd className="text-sage-700">{plant.light ? `${plant.light} лк` : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-sage-500">Влажность</dt>
                <dd className="text-sage-700">{plant.humidity ? `${plant.humidity}%` : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-sage-500">Полив</dt>
                <dd className="text-sage-700">{plant.watering || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-sage-500">Питомцы</dt>
                <dd className="text-sage-700">{petLabel(plant)}</dd>
              </div>
            </dl>
          )}

          {showDetails && plant.comment && (
            <p className="mt-3 text-sm leading-relaxed text-sage-600">{plant.comment}</p>
          )}
        </div>
      </div>
    </Tag>
  );
}
