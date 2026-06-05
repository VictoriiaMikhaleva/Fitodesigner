import type { Plant } from "../types";
import plantsJson from "./plants.json";

export function loadPlants(): Plant[] {
  if (!Array.isArray(plantsJson)) return [];
  return plantsJson as Plant[];
}

export const plants = loadPlants();

export function hasPlantsData(): boolean {
  return plants.length > 0;
}
