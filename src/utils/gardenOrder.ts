import type { Plant } from "../types";

type NamedCard = {
  id: string;
  nameRu: string;
};

export function orderGardenPlants<T extends NamedCard>(plants: T[], roundIndex: number): T[] {
  const groups = new Map<string, T[]>();
  for (const plant of plants) {
    const list = groups.get(plant.nameRu);
    if (list) list.push(plant);
    else groups.set(plant.nameRu, [plant]);
  }

  for (const list of groups.values()) {
    list.sort((left, right) => Number(left.id) - Number(right.id));
    const shift = list.length > 0 ? ((roundIndex % list.length) + list.length) % list.length : 0;
    if (shift > 0) {
      const rotated = list.slice(shift).concat(list.slice(0, shift));
      list.splice(0, list.length, ...rotated);
    }
  }

  const names = [...groups.keys()].sort((left, right) => left.localeCompare(right, "ru"));
  if (names.length === 0) return [];
  const nameShift = ((roundIndex % names.length) + names.length) % names.length;
  const rotatedNames = names.slice(nameShift).concat(names.slice(0, nameShift));
  const queued = rotatedNames.map((name) => [...(groups.get(name) ?? [])]);
  const result: T[] = [];
  let pending = queued.reduce((sum, list) => sum + list.length, 0);

  while (pending > 0) {
    let added = false;
    for (const list of queued) {
      if (list.length === 0) continue;
      if (result.length > 0 && result[result.length - 1].nameRu === list[0].nameRu) continue;
      result.push(list.shift() as T);
      pending -= 1;
      added = true;
    }

    if (!added) {
      for (const list of queued) {
        while (list.length > 0) {
          result.push(list.shift() as T);
          pending -= 1;
        }
      }
    }
  }

  return result;
}

export function gardenSelectionBlocked(plants: Plant[], selectedIds: string[], candidate: Plant): string | null {
  if (!candidate.garden) return null;
  const duplicate = selectedIds.some((id) => {
    if (id === candidate.id) return false;
    const selected = plants.find((plant) => plant.id === id);
    return selected?.nameRu === candidate.nameRu;
  });

  if (!duplicate) return null;
  return `«${candidate.nameRu}» уже есть в этом раунде. Другая окраска откроется в следующей практике.`;
}
