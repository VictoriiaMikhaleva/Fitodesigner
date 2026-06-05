import type { Plant, PlantFilters } from "../types";

export const DEFAULT_FILTERS: PlantFilters = {
  query: "",
  category: "all",
  light: "all",
  humidity: "all",
  petSafeOnly: false,
};

export function getPlantCategories(plants: Plant[]): string[] {
  return [...new Set(plants.map((plant) => plant.category).filter(Boolean))].sort();
}

function classifyLightLevel(value: string): "low" | "medium" | "high" | "unknown" {
  const text = value.toLowerCase();

  if (/слаб|темн|тенев|мало|низк|искусствен/.test(text)) return "low";
  if (/ярк|солнеч|прям|много/.test(text)) return "high";
  if (/рассеян|средн|умерен/.test(text)) return "medium";

  const match = text.match(/(\d+)\s*[–\-—]\s*(\d+)/);
  if (match) {
    const max = Number(match[2]);
    if (max <= 1000) return "low";
    if (max >= 2500) return "high";
    return "medium";
  }

  return "unknown";
}

function classifyHumidityLevel(value: string): "low" | "medium" | "high" | "unknown" {
  const text = value.toLowerCase();

  if (/сух|низк/.test(text)) return "low";
  if (/высок|влажн/.test(text) && !/низк/.test(text)) return "high";

  const match = text.match(/(\d+)\s*[–\-—]\s*(\d+)/);
  if (match) {
    const avg = (Number(match[1]) + Number(match[2])) / 2;
    if (avg < 45) return "low";
    if (avg > 60) return "high";
    return "medium";
  }

  return "unknown";
}

export function filterPlants(plants: Plant[], filters: PlantFilters): Plant[] {
  const query = filters.query.trim().toLowerCase();

  return plants.filter((plant) => {
    if (filters.category !== "all" && plant.category !== filters.category) {
      return false;
    }

    if (filters.petSafeOnly && plant.petSafe !== true) {
      return false;
    }

    if (filters.light !== "all") {
      const level = classifyLightLevel(`${plant.light} ${plant.comment}`);
      if (level !== filters.light && level !== "unknown") {
        return false;
      }
    }

    if (filters.humidity !== "all") {
      const level = classifyHumidityLevel(`${plant.humidity} ${plant.comment}`);
      if (level !== filters.humidity && level !== "unknown") {
        return false;
      }
    }

    if (!query) return true;

    const haystack = [
      plant.nameRu,
      plant.nameLat,
      plant.family,
      plant.category,
      plant.comment,
      plant.toxicity,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}
