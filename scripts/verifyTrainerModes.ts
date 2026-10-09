import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gardenBriefs } from "../src/data/gardenBriefs";
import { gardenPlants } from "../src/data/gardenPlants";
import { plants as indoorPlants } from "../src/data/plantsLoader";
import type { Plant } from "../src/types";
import { filterGardenPlants } from "../src/utils/gardenFilters";
import { gardenSelectionBlocked, orderGardenPlants } from "../src/utils/gardenOrder";
import { scoreGardenSelection } from "../src/utils/gardenScoring";
import { DEFAULT_FILTERS } from "../src/utils/plantFilters";
import { scoreSelection } from "../src/utils/scoring";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distPhotos = path.resolve(root, "../../plant-selection-dist/garden/assets/plants");
const sourcePhotos = path.resolve(root, "../garden_plants/assets/plants");
const failures: string[] = [];

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

function photoFile(plant: Plant): string {
  return plant.imageUrl.split("/").pop() || "";
}

function fileExists(directory: string, fileName: string): boolean {
  return fs.existsSync(path.join(directory, fileName));
}

check(indoorPlants.length === 107, `indoor count ${indoorPlants.length}`);
check(new Set(indoorPlants.map((plant) => plant.id)).size === 107, "indoor ids are not unique");
check(indoorPlants.every((plant) => !plant.garden), "indoor cards gained a garden profile");
check(indoorPlants.every((plant) => plant.imageUrl.startsWith("plants/")), "indoor photo path changed");

check(gardenPlants.length === 135, `garden count ${gardenPlants.length}`);
check(new Set(gardenPlants.map((plant) => plant.id)).size === 135, "garden ids are not unique");
check(gardenPlants.every((plant) => plant.garden?.sourceId === Number(plant.id)), "garden id link broken");
check(
  gardenPlants.every((plant) => plant.imageUrl === `/garden/assets/plants/${plant.garden?.sourceId}.webp`),
  "garden photo is not bound to id",
);
check(
  gardenPlants.every((plant) => plant.category === plant.garden?.colorLabel && Boolean(plant.garden?.color)),
  "garden color link broken",
);

const missingSource = gardenPlants.filter((plant) => !fileExists(sourcePhotos, photoFile(plant)));
const missingDist = gardenPlants.filter((plant) => !fileExists(distPhotos, photoFile(plant)));
check(missingSource.length === 0, `missing source photos: ${missingSource.map((plant) => plant.id).join(",")}`);
check(missingDist.length === 0, `missing dist photos: ${missingDist.map((plant) => plant.id).join(",")}`);

const names = new Map<string, Plant[]>();
for (const plant of gardenPlants) {
  const list = names.get(plant.nameRu) ?? [];
  list.push(plant);
  names.set(plant.nameRu, list);
}

const peonies = names.get("Пион") ?? [];
const lupines = names.get("Люпин") ?? [];
const anemones = names.get("Анемона") ?? [];
check(peonies.length === 3, `peony cards ${peonies.length}`);
check(lupines.length === 2, `lupine cards ${lupines.length}`);
check(anemones.length === 1 && anemones[0]?.garden?.color === "white", "anemone is not the single white card");
check(new Set(peonies.map((plant) => plant.imageUrl)).size === peonies.length, "peony photos collide");
check(new Set(peonies.map((plant) => plant.garden?.color)).size === peonies.length, "peony colors collide");

const visible = filterGardenPlants(gardenPlants, DEFAULT_FILTERS);
check(visible.length === 135, `default garden filter hid cards: ${visible.length}`);

const rounds = Array.from({ length: 12 }, (_, index) => orderGardenPlants(gardenPlants, index));
check(rounds.every((round) => round.length === 135), "a round dropped cards");
check(
  rounds.every((round) => new Set(round.map((plant) => plant.id)).size === 135),
  "a round repeated an id",
);

const firstWaveUnique = rounds.every((round) => {
  const wave = round.slice(0, names.size);
  return new Set(wave.map((plant) => plant.nameRu)).size === wave.length;
});
check(firstWaveUnique, "the first pass of a round repeats a culture");

const peonyLeads = rounds.map((round) => round.find((plant) => plant.nameRu === "Пион")?.id);
check(new Set(peonyLeads).size === 3, `peony color rotation ${peonyLeads.join(",")}`);

const blocked = gardenSelectionBlocked(gardenPlants, [peonies[0].id], peonies[1]);
check(Boolean(blocked), "same display name was accepted in one round");
check(gardenSelectionBlocked(gardenPlants, [peonies[0].id], lupines[0]) === null, "different cultures were blocked");

const sunny = gardenBriefs.find((brief) => brief.id === "garden-sunny-bed");
const white = gardenBriefs.find((brief) => brief.id === "garden-white-sun");
const pink = gardenBriefs.find((brief) => brief.id === "garden-pink-hardy");
const shade = gardenBriefs.find((brief) => brief.id === "garden-shade");
const moist = gardenBriefs.find((brief) => brief.id === "garden-moist");
const spring = gardenBriefs.find((brief) => brief.id === "garden-spring");
const autumn = gardenBriefs.find((brief) => brief.id === "garden-autumn-sun");
check(Boolean(sunny && white && pink && shade && moist && spring && autumn), "a garden level brief is missing");

const whitePeony = peonies.find((plant) => plant.garden?.color === "white");
const pinkPeony = peonies.find((plant) => plant.garden?.color === "pink");
check(Boolean(whitePeony && pinkPeony && sunny && white), "peony fixtures missing");

if (sunny && white && whitePeony && pinkPeony) {
  const good = scoreGardenSelection(sunny, gardenPlants, [whitePeony.id], "novice");
  const wrongColor = scoreGardenSelection(white, gardenPlants, [pinkPeony.id], "practitioner");
  const rightColor = scoreGardenSelection(white, gardenPlants, [whitePeony.id], "practitioner");
  check(good.plantResults[0]?.plantId === whitePeony.id, "score lost the card id");
  check(good.plantResults[0]?.plantName === "Пион", "score renamed the plant");
  check(good.totalScore >= 80, `sunny white peony scored ${good.totalScore}`);
  check(rightColor.totalScore > wrongColor.totalScore, `color scores ${rightColor.totalScore} vs ${wrongColor.totalScore}`);
  check(wrongColor.mistakes.some((item) => item.includes("Окраска")), "wrong color did not fail the color check");
}

for (const brief of gardenBriefs) {
  for (const difficulty of ["novice", "practitioner", "pro"] as const) {
    const sample = gardenPlants.slice(0, brief.minPlants).map((plant) => plant.id);
    const result = scoreGardenSelection(brief, gardenPlants, sample, difficulty);
    check(result.totalScore >= 0 && result.totalScore <= 100, `${brief.id}/${difficulty} score out of range`);
    check(result.plantResults.every((item) => gardenPlants.some((plant) => plant.id === item.plantId)), "score referenced a foreign id");
  }
}

const indoorBriefPlants = indoorPlants.slice(0, 2).map((plant) => plant.id);
const indoorResult = scoreSelection(
  {
    id: "dark-corridor",
    title: "Тёмный коридор",
    roomType: "Коридор",
    light: "Слабое освещение",
    humidity: "35–50%",
    temperature: "19–23°C",
    hasPets: false,
    requirements: ["Теневыносливые растения"],
    difficulty: "novice",
    minPlants: 2,
    maxPlants: 4,
    description: "Длинный коридор без окон.",
  },
  indoorPlants,
  indoorBriefPlants,
  "novice",
);
check(indoorResult.totalScore >= 0 && indoorResult.totalScore <= 100, "indoor score broke");
check(indoorResult.plantResults.length === 2, "indoor score dropped plants");
check(!indoorResult.plantResults.some((item) => gardenPlants.some((plant) => plant.id === item.plantId && item.plantName !== indoorPlants.find((plant) => plant.id === item.plantId)?.nameRu)), "indoor result mixed catalogs");

let seed = 14;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const seenPeonyColors = new Set<string>();
let questionIssues = 0;
for (let index = 0; index < 400; index += 1) {
  const shown = gardenPlants[Math.floor(random() * gardenPlants.length)];
  const options = [shown.nameRu];
  const used = new Set([shown.nameRu]);
  const pool = [...gardenPlants];
  while (options.length < 4 && pool.length > 0) {
    const pick = pool.splice(Math.floor(random() * pool.length), 1)[0];
    if (used.has(pick.nameRu)) continue;
    used.add(pick.nameRu);
    options.push(pick.nameRu);
  }
  if (new Set(options).size !== options.length || options[0] !== shown.nameRu) questionIssues += 1;
  if (shown.imageUrl !== `/garden/assets/plants/${shown.garden?.sourceId}.webp`) questionIssues += 1;
  if (shown.nameRu === "Пион") seenPeonyColors.add(shown.garden?.color || "");
}
check(questionIssues === 0, `recognition samples failed ${questionIssues}`);
check(seenPeonyColors.size === 3, `peony colors in samples ${[...seenPeonyColors].join(",")}`);

const summary = {
  indoor: indoorPlants.length,
  garden: gardenPlants.length,
  uniqueNames: names.size,
  colorVariants: gardenPlants.length - names.size,
  colors: gardenPlants.reduce<Record<string, number>>((counts, plant) => {
    const color = plant.garden?.color || "";
    counts[color] = (counts[color] || 0) + 1;
    return counts;
  }, {}),
  peonies: peonies.map((plant) => `${plant.id}:${plant.garden?.color}:${photoFile(plant)}`),
  lupines: lupines.map((plant) => `${plant.id}:${plant.garden?.color}:${photoFile(plant)}`),
  anemones: anemones.map((plant) => `${plant.id}:${plant.garden?.color}:${photoFile(plant)}`),
  levels: {
    novice: gardenBriefs.filter((brief) => brief.difficulty === "novice").map((brief) => brief.id),
    practitioner: gardenBriefs.filter((brief) => brief.difficulty === "practitioner").map((brief) => brief.id),
    pro: gardenBriefs.filter((brief) => brief.difficulty === "pro").map((brief) => brief.id),
  },
  failures,
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length > 0) {
  process.exitCode = 1;
}
