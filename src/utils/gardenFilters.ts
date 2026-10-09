import type { Plant, PlantFilters } from "../types";

const MOISTURE_RANK: Record<string, number> = {
  dry: 1,
  moderate: 2,
  moist: 3,
  wet: 4,
};

export function parseBound(value: string): [number, number] | null {
  const match = value.match(/(\d+)\s*[–\-—]\s*(\d+)/);
  if (match) return [Number(match[1]), Number(match[2])];
  const single = value.match(/(\d+)/);
  if (!single) return null;
  const number = Number(single[1]);
  return [number, number];
}

export function discreteOverlap(plantRange: [number, number], taskRange: [number, number]): number {
  const left = Math.max(plantRange[0], taskRange[0]);
  const right = Math.min(plantRange[1], taskRange[1]);
  if (right < left) return 0;
  return (right - left + 1) / (taskRange[1] - taskRange[0] + 1);
}

function sunBand(value: NonNullable<PlantFilters["gardenSun"]>): [number, number] | null {
  if (value === "shade") return [1, 2];
  if (value === "part") return [3, 3];
  if (value === "sun") return [4, 5];
  return null;
}

export function filterGardenPlants(plants: Plant[], filters: PlantFilters): Plant[] {
  const query = filters.query.trim().toLowerCase();
  const band = sunBand(filters.gardenSun ?? "all");

  return plants.filter((plant) => {
    if (!plant.garden) return false;
    if (filters.category !== "all" && plant.category !== filters.category) return false;

    if (band) {
      const sun = parseBound(plant.garden.sun);
      if (!sun || discreteOverlap(sun, band) <= 0) return false;
    }

    if (!query) return true;

    const haystack = [
      plant.nameRu,
      plant.nameLat,
      plant.garden.color,
      plant.garden.colorLabel,
      plant.garden.bloomNote,
      plant.garden.gardenCycle,
      plant.garden.lifeCycle,
      plant.garden.russiaWintering,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function moistureOverlaps(plant: Plant, wanted: string[]): boolean {
  if (!plant.garden) return false;
  const min = MOISTURE_RANK[plant.garden.soilMoistureMin];
  const max = MOISTURE_RANK[plant.garden.soilMoistureMax];
  if (min == null || max == null) return false;
  return wanted.some((item) => {
    const rank = MOISTURE_RANK[item];
    return rank != null && rank >= min && rank <= max;
  });
}
