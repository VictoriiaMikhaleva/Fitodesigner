import { useMemo, useState } from "react";
import type { Plant, PlantFilters } from "../types";
import { DEFAULT_FILTERS, filterPlants, getPlantCategories } from "../utils/plantFilters";
import { FilterPanel } from "./FilterPanel";
import { PlantCard } from "./PlantCard";

type PlantCatalogProps = {
  plants: Plant[];
  selectedIds: string[];
  maxPlants?: number;
  onTogglePlant: (plant: Plant) => void;
  title?: string;
};

export function PlantCatalog({
  plants,
  selectedIds,
  maxPlants,
  onTogglePlant,
  title = "Каталог растений",
}: PlantCatalogProps) {
  const [filters, setFilters] = useState<PlantFilters>(DEFAULT_FILTERS);
  const categories = useMemo(() => getPlantCategories(plants), [plants]);
  const filteredPlants = useMemo(() => filterPlants(plants, filters), [plants, filters]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-sage-800">{title}</h2>
          <p className="mt-1 text-sm text-sage-600">
            Показано {filteredPlants.length} из {plants.length}
          </p>
        </div>
      </div>

      <FilterPanel filters={filters} categories={categories} onChange={setFilters} />

      {filteredPlants.length === 0 ? (
        <div className="card p-8 text-center text-sage-600">
          По выбранным фильтрам растений не найдено. Попробуйте изменить условия поиска.
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredPlants.map((plant) => {
            const selected = selectedIds.includes(plant.id);
            const limitReached = Boolean(maxPlants && selectedIds.length >= maxPlants && !selected);

            return (
              <PlantCard
                key={plant.id}
                plant={plant}
                selected={selected}
                disabled={limitReached}
                onToggle={onTogglePlant}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
