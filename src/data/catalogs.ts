import type { CatalogMode, Plant } from "../types";
import { gardenPlants } from "./gardenPlants";
import { plants as indoorPlants } from "./plantsLoader";

export function plantsForCatalog(catalog: CatalogMode): Plant[] {
  return catalog === "garden" ? gardenPlants : indoorPlants;
}
