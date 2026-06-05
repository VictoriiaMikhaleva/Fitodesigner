import type { Brief, Plant } from "../types";
import { PlantCard } from "./PlantCard";

type SelectedPlantsPanelProps = {
  brief: Brief;
  plants: Plant[];
  selectedIds: string[];
  onRemove: (plantId: string) => void;
  onCheck: () => void;
};

export function SelectedPlantsPanel({
  brief,
  plants,
  selectedIds,
  onRemove,
  onCheck,
}: SelectedPlantsPanelProps) {
  const selectedPlants = selectedIds
    .map((id) => plants.find((plant) => plant.id === id))
    .filter((plant): plant is Plant => Boolean(plant));

  const canCheck = selectedPlants.length >= brief.minPlants && selectedPlants.length <= brief.maxPlants;

  return (
    <aside className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-sage-800">Моё решение</h2>
          <p className="mt-1 text-sm text-sage-600">
            Выбрано {selectedPlants.length} из {brief.maxPlants} (минимум {brief.minPlants})
          </p>
        </div>
      </div>

      {selectedPlants.length === 0 ? (
        <div className="mt-5 rounded-2xl bg-sage-50 p-6 text-center text-sm text-sage-600">
          Пока ничего не выбрано. Добавьте растения из каталога, чтобы сформировать подбор.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {selectedPlants.map((plant) => (
            <div key={plant.id} className="space-y-2">
              <PlantCard plant={plant} showDetails={false} />
              <button
                type="button"
                className="text-sm font-medium text-red-700 hover:text-red-800"
                onClick={() => onRemove(plant.id)}
              >
                Удалить из подбора
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canCheck}
        onClick={onCheck}
      >
        Проверить подбор
      </button>

      {!canCheck && (
        <p className="mt-3 text-sm text-sage-600">
          {selectedPlants.length < brief.minPlants
            ? `Выберите ещё минимум ${brief.minPlants - selectedPlants.length} растений.`
            : `Можно выбрать не больше ${brief.maxPlants} растений.`}
        </p>
      )}
    </aside>
  );
}
