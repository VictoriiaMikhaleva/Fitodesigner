import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import type { Plant } from "../src/types/index";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXCEL_CANDIDATES = [
  path.join(PROJECT_ROOT, "data", "Каталог 100 растений для озеленения.xlsx"),
  path.join(PROJECT_ROOT, "Каталог 100 растений для озеленения.xlsx"),
];
const OUTPUT_PATH = path.join(PROJECT_ROOT, "src", "data", "plants.json");
const CATALOG_SHEET_HINTS = ["лист1", "каталог", "растен"];

type FieldKey = Exclude<keyof Plant, "id">;

const FIELD_ALIASES: Record<FieldKey, string[]> = {
  imageUrl: ["фото"],
  nameRu: ["русское название", "название ru", "название"],
  nameLat: ["латинское название", "название lat", "латинское"],
  family: ["семейство"],
  category: ["категория"],
  light: ["свет"],
  humidity: ["влажность"],
  temperature: ["температура"],
  watering: ["полив —", "полив"],
  soil: ["рецептов грунтов", "грунт из гайда", "грунт"],
  ph: ["ph", "ph почвы"],
  petSafe: ["опасно для питомцев", "питомц"],
  toxicity: ["токсичность", "ядовитость"],
  comment: ["комментар", "описание", "примечан"],
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function resolveExcelPath(): string {
  for (const candidate of EXCEL_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Excel-файл не найден. Ожидается один из путей:\n${EXCEL_CANDIDATES.join("\n")}`,
  );
}

function pickCatalogSheet(workbook: XLSX.WorkBook): string {
  const byHint = workbook.SheetNames.find((name) => {
    const normalized = normalizeHeader(name);
    return CATALOG_SHEET_HINTS.some((hint) => normalized.includes(hint));
  });

  return byHint ?? workbook.SheetNames[0];
}

function buildHeaderMap(headers: unknown[]): Map<FieldKey, number> {
  const normalizedHeaders = headers.map(normalizeHeader);
  const map = new Map<FieldKey, number>();
  const usedIndices = new Set<number>();

  const fields = Object.entries(FIELD_ALIASES) as [FieldKey, string[]][];

  for (const [field, aliases] of fields) {
    const sortedAliases = [...aliases].sort((a, b) => b.length - a.length);
    const index = normalizedHeaders.findIndex(
      (header, headerIndex) =>
        !usedIndices.has(headerIndex) &&
        sortedAliases.some((alias) => header.includes(alias)),
    );

    if (index >= 0) {
      map.set(field, index);
      usedIndices.add(index);
    }
  }

  if (!map.has("nameRu")) {
    throw new Error("Не удалось найти колонку с русским названием растения.");
  }

  return map;
}

function cellValue(row: unknown[], index: number | undefined): string {
  if (index === undefined) {
    return "";
  }

  const value = row[index];
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(/\s+/g, " ").trim();
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/['’`"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "plant";
}

function parsePetSafe(rawValue: string): boolean | null {
  const value = rawValue.trim().toLowerCase();
  if (!value) {
    return null;
  }

  if (value.startsWith("да")) {
    return false;
  }

  if (value.startsWith("нет") || value.includes("нетоксич")) {
    return true;
  }

  return null;
}

function parseToxicity(rawValue: string): string {
  const value = rawValue.trim();
  if (!value) {
    return "";
  }

  if (value === "Да") {
    return "Опасно для питомцев";
  }

  if (value === "Нет") {
    return "";
  }

  return value;
}

function rowToPlant(row: unknown[], headerMap: Map<FieldKey, number>, index: number): Plant | null {
  const get = (field: FieldKey) => cellValue(row, headerMap.get(field));
  const nameRu = get("nameRu");

  if (!nameRu) {
    return null;
  }

  const petColumn = get("petSafe");
  const nameLat = get("nameLat");
  const idBase = slugify(nameLat || nameRu);

  return {
    id: `${idBase}-${String(index + 1).padStart(3, "0")}`,
    nameRu,
    nameLat,
    family: get("family"),
    category: get("category"),
    light: get("light"),
    humidity: get("humidity"),
    temperature: get("temperature"),
    watering: get("watering"),
    soil: get("soil"),
    ph: get("ph"),
    petSafe: parsePetSafe(petColumn),
    toxicity: parseToxicity(petColumn),
    comment: get("comment"),
    imageUrl: get("imageUrl"),
  };
}

function convertWorkbookToPlants(workbook: XLSX.WorkBook): Plant[] {
  const sheetName = pickCatalogSheet(workbook);
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`Лист «${sheetName}» не найден в Excel-файле.`);
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  if (rows.length === 0) {
    throw new Error(`Лист «${sheetName}» пуст.`);
  }

  const headerMap = buildHeaderMap(rows[0]);
  const plants: Plant[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const plant = rowToPlant(rows[i], headerMap, plants.length);
    if (plant) {
      plants.push(plant);
    }
  }

  if (plants.length === 0) {
    throw new Error(`На листе «${sheetName}» не найдено строк с растениями.`);
  }

  console.log(`Лист: ${sheetName}`);
  console.log(`Растений: ${plants.length}`);

  return plants;
}

function main(): void {
  const excelPath = resolveExcelPath();
  const workbook = XLSX.readFile(excelPath);
  const plants = convertWorkbookToPlants(workbook);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(plants, null, 2)}\n`, "utf8");

  console.log(`Источник: ${excelPath}`);
  console.log(`JSON: ${OUTPUT_PATH}`);
}

main();
