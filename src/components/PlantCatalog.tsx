import { useMemo, useState } from "react";
import type { CatalogMode, Plant, PlantFilters } from "../types";
import { filterGardenPlants } from "../utils/gardenFilters";
import { orderGardenPlants } from "../utils/gardenOrder";
import { DEFAULT_FILTERS, filterPlants, getPlantCategories } from "../utils/plantFilters";
import { FilterPanel } from "./FilterPanel";
import { PlantCard } from "./PlantCard";

type PlantCatalogProps = {
  plants: Plant[];
  selectedIds: string[];
  maxPlants?: number;
  onTogglePlant: (plant: Plant) => void;
  title?: string;
  initialFilters?: PlantFilters;
  catalog?: CatalogMode;
  orderSeed?: number;
};

export function PlantCatalog({
  plants,
  selectedIds,
  maxPlants,
  onTogglePlant,
  title = "Каталог растений",
  initialFilters,
  catalog = "indoor",
  orderSeed = 0,
}: PlantCatalogProps) {
  const [filters, setFilters] = useState<PlantFilters>(initialFilters ?? DEFAULT_FILTERS);
  const categories = useMemo(() => getPlantCategories(plants), [plants]);
  const filteredPlants = useMemo(() => {
    const filtered = catalog === "garden" ? filterGardenPlants(plants, filters) : filterPlants(plants, filters);
    return catalog === "garden" ? orderGardenPlants(filtered, orderSeed) : filtered;
  }, [catalog, filters, orderSeed, plants]);

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

      <FilterPanel filters={filters} categories={categories} onChange={setFilters} catalog={catalog} />

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
