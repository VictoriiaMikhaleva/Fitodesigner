import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogFile = path.resolve(root, "../Choose_your_plant/plant_selector_catalog_v6_photos_lux_fixed.html");
const photoDir = path.resolve(root, "../Choose_your_plant/assets/plants");
const plantsFile = path.resolve(root, "src/data/plants.json");
const trainerPhotoDir = path.resolve(root, "public/plants");
const EXPECTED = 127;

function plantSlug(nameLat) {
  return String(nameLat || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/×/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function trainerId(nameLat, id) {
  return `${plantSlug(nameLat)}-${String(id).padStart(3, "0")}`;
}

function catalogIdFromTrainerId(id) {
  const match = String(id).match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function petFields(petDanger) {
  const value = String(petDanger || "").trim();
  if (/^не подтверждено/i.test(value)) {
    return {
      petSafe: null,
      toxicity: "Безопасность не подтверждена",
    };
  }
  if (/^нет/i.test(value) || /нетоксич/i.test(value)) {
    return { petSafe: true, toxicity: "" };
  }
  return { petSafe: false, toxicity: "Опасно для питомцев" };
}

function toTrainerPlant(plant) {
  const id = trainerId(plant.nameLat, plant.id);
  const { petSafe, toxicity } = petFields(plant.petDanger);
  return {
    id,
    nameRu: plant.nameRu,
    nameLat: plant.nameLat,
    family: plant.family,
    category: plant.category,
    light: plant.light,
    humidity: plant.humidity,
    temperature: plant.temp,
    watering: plant.watering,
    soil: plant.soil,
    ph: plant.ph,
    petSafe,
    toxicity,
    comment: plant.comments,
    imageUrl: `plants/${id.replace(/-/g, "_")}.webp`,
  };
}

function copyPhoto(catalogId, imageUrl) {
  const src = path.join(photoDir, `${catalogId}.webp`);
  const dest = path.join(trainerPhotoDir, path.basename(imageUrl));
  if (!fs.existsSync(src)) {
    throw new Error(`Нет фотографии каталога для id ${catalogId}: ${src}`);
  }
  fs.mkdirSync(trainerPhotoDir, { recursive: true });
  fs.copyFileSync(src, dest);
}

const html = fs.readFileSync(catalogFile, "utf8");
const match = html.match(/const RAW_PLANTS = (\[[\s\S]*?\]);/);
if (!match) throw new Error("RAW_PLANTS not found");
const catalog = JSON.parse(match[1]);
if (!Array.isArray(catalog) || catalog.length !== EXPECTED) {
  throw new Error(`Ожидалось ${EXPECTED} комнатных карточек, получено ${catalog.length}`);
}

const existing = JSON.parse(fs.readFileSync(plantsFile, "utf8"));
if (!Array.isArray(existing)) throw new Error("plants.json is not an array");

const byCatalogId = new Map();
for (const plant of existing) {
  const catalogId = catalogIdFromTrainerId(plant.id);
  if (catalogId != null) byCatalogId.set(catalogId, plant);
}

const kept = existing.filter((plant) => {
  const catalogId = catalogIdFromTrainerId(plant.id);
  return catalogId == null || catalogId <= 107;
});
if (kept.length !== 107) {
  throw new Error(`Ожидалось сохранить 107 старых карточек, получено ${kept.length}`);
}

const added = [];
for (const plant of catalog) {
  if (plant.id <= 107) continue;
  const record = toTrainerPlant(plant);
  copyPhoto(plant.id, record.imageUrl);
  added.push(record);
}

const next = [...kept, ...added];
if (next.length !== EXPECTED) {
  throw new Error(`После синхронизации ${next.length}, ожидалось ${EXPECTED}`);
}

const ids = new Set(next.map((plant) => plant.id));
if (ids.size !== next.length) throw new Error("Совпали id тренажёра");

const pilea = next.find((plant) => catalogIdFromTrainerId(plant.id) === 113);
const ceropegia = next.find((plant) => catalogIdFromTrainerId(plant.id) === 114);
if (!pilea || pilea.petSafe !== null) {
  throw new Error("ID 113 должен остаться с petSafe=null");
}
if (!ceropegia || ceropegia.petSafe !== null) {
  throw new Error("ID 114 должен остаться с petSafe=null");
}

const gardenia = next.find((plant) => catalogIdFromTrainerId(plant.id) === 126);
if (!gardenia || gardenia.soil === "Для кислолюбивых") {
  throw new Error("Гардения не должна иметь грунт «Для кислолюбивых»");
}

fs.writeFileSync(plantsFile, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log(`indoor trainer data: ${kept.length} kept + ${added.length} added = ${next.length} → ${plantsFile}`);
console.log(`photos copied for ids ${added.map((plant) => catalogIdFromTrainerId(plant.id)).join(", ")}`);
