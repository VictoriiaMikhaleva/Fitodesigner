import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gardenFile = path.resolve(root, "../garden_plants/assets/js/garden-plants-data.js");
const photoDir = path.resolve(root, "../garden_plants/assets/plants");
const outFile = path.resolve(root, "src/data/garden-plants.json");

const COLOR_LABELS = {
  white: "Белые",
  blue: "Сине-зелёные (листва)",
  sky: "Синие / голубые",
  purple: "Фиолетовые",
  yellow: "Жёлтые",
  orange: "Оранжевые",
  red: "Красные",
  pink: "Розовые",
};

const SUN_LABELS = {
  1: "Тень",
  2: "Теневыносливое",
  3: "Полутень",
  4: "Светолюбивое",
  5: "Полное солнце",
};

const MOISTURE_LABELS = {
  dry: "Сухой",
  moderate: "Умеренно влажный",
  moist: "Равномерно влажный",
  wet: "Постоянно влажный",
};

function parseRange(value) {
  const match = String(value ?? "").match(/(\d+)\s*[–\-—]\s*(\d+)/);
  if (match) return [Number(match[1]), Number(match[2])];
  const single = String(value ?? "").match(/(\d+)/);
  if (!single) return null;
  const number = Number(single[1]);
  return [number, number];
}

function sunLabel(sun) {
  const range = parseRange(sun);
  if (!range) return String(sun ?? "");
  const [min, max] = range;
  const start = SUN_LABELS[min] || String(min);
  const end = SUN_LABELS[max] || String(max);
  return min === max ? start : `${start} — ${end}`;
}

function moistureLabel(min, max) {
  const start = MOISTURE_LABELS[min] || String(min ?? "");
  const end = MOISTURE_LABELS[max] || String(max ?? "");
  return min === max ? start : `${start} — ${end}`;
}

const source = fs.readFileSync(gardenFile, "utf8");
const marker = "const GARDEN_RAW_PLANTS = ";
const start = source.indexOf(marker);
const end = source.indexOf("const GARDEN_COLOR_LABELS");
if (start < 0 || end < 0) {
  throw new Error("Не удалось прочитать GARDEN_RAW_PLANTS");
}

const plants = JSON.parse(source.slice(start + marker.length, end).trim().replace(/;\s*$/, ""));
if (!Array.isArray(plants) || plants.length !== 135) {
  throw new Error(`Ожидалось 135 садовых карточек, получено ${plants.length}`);
}

const adapted = plants.map((plant) => {
  const fileName = String(plant.photo ?? "").split("/").pop();
  if (!fileName || !fs.existsSync(path.join(photoDir, fileName))) {
    throw new Error(`Нет фотографии для id ${plant.id}: ${plant.photo}`);
  }

  return {
    id: plant.id,
    nameRu: plant.nameRu,
    nameLat: plant.nameLat || "",
    color: plant.color,
    colorLabel: COLOR_LABELS[plant.color] || plant.color,
    height: plant.height,
    bloom: plant.bloom,
    bloomNote: plant.bloomNote,
    sun: plant.sun,
    sunLabel: sunLabel(plant.sun),
    photo: `/garden/assets/plants/${fileName}`,
    lifeCycle: plant.lifeCycle || "",
    gardenCycle: plant.gardenCycle || "",
    russiaWintering: plant.russiaWintering || "",
    soilMoistureMin: plant.soilMoistureMin,
    soilMoistureMax: plant.soilMoistureMax,
    moistureLabel: moistureLabel(plant.soilMoistureMin, plant.soilMoistureMax),
  };
});

const ids = new Set(adapted.map((plant) => plant.id));
const photos = new Set(adapted.map((plant) => plant.photo));
if (ids.size !== adapted.length || photos.size !== adapted.length) {
  throw new Error("В адаптере совпали id или фотографии");
}

fs.writeFileSync(outFile, `${JSON.stringify(adapted, null, 2)}\n`, "utf8");
console.log(`garden trainer data: ${adapted.length} cards → ${outFile}`);
