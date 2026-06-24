import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLANTS_DIR = path.join(PROJECT_ROOT, "public", "plants");
const PLANTS_JSON = path.join(PROJECT_ROOT, "src", "data", "plants.json");
const ASSETS_DIR = path.join(
  os.homedir(),
  ".cursor",
  "projects",
  "c-Users-vitya-Desktop-public-Fitodesigner",
  "assets",
);
const MAX_SIZE = 1024;
const WEBP_QUALITY = 92;
const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

type PlantRecord = {
  id: string;
  imageUrl?: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function plantFileBase(id: string): string {
  return id.replace(/-/g, "_");
}

function findAssetForNumber(number: string): string | null {
  if (!fs.existsSync(ASSETS_DIR)) return null;

  const matches = fs
    .readdirSync(ASSETS_DIR)
    .filter((file) => {
      const lower = file.toLowerCase();
      return SOURCE_EXTENSIONS.has(path.extname(lower)) && lower.includes(`_${number}-`);
    });

  if (matches.length === 0) return null;
  return path.join(ASSETS_DIR, matches[0]!);
}

function writeBufferSafe(targetPath: string, buffer: Buffer): void {
  const tempPath = `${targetPath}.tmp`;
  fs.writeFileSync(tempPath, buffer);

  try {
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    fs.renameSync(tempPath, targetPath);
  } catch {
    try {
      fs.copyFileSync(tempPath, targetPath);
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      throw error;
    }
  }
}

async function optimizeImage(filePath: string): Promise<void> {
  const ext = path.extname(filePath).toLowerCase();
  if (!SOURCE_EXTENSIONS.has(ext)) return;

  const baseName = path.basename(filePath, ext);
  const outputPath = path.join(PLANTS_DIR, `${baseName}.webp`);

  const inputStats = fs.statSync(filePath);
  const image = sharp(filePath, { failOn: "none" }).rotate();
  const metadata = await image.metadata();

  const buffer = await image
    .resize(MAX_SIZE, MAX_SIZE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
      smartSubsample: false,
      preset: "photo",
    })
    .toBuffer();

  writeBufferSafe(outputPath, buffer);

  if (filePath !== outputPath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  console.log(
    `${baseName}.webp: ${formatBytes(inputStats.size)} → ${formatBytes(buffer.length)} (${metadata.width ?? "?"}×${metadata.height ?? "?"})`,
  );
}

async function reencodeWebp(filePath: string): Promise<void> {
  const baseName = path.basename(filePath, ".webp");
  const inputStats = fs.statSync(filePath);
  const image = sharp(filePath, { failOn: "none" }).rotate();
  const metadata = await image.metadata();

  const buffer = await image
    .resize(MAX_SIZE, MAX_SIZE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
      smartSubsample: false,
      preset: "photo",
    })
    .toBuffer();

  writeBufferSafe(filePath, buffer);

  console.log(
    `${baseName}.webp [reencode]: ${formatBytes(inputStats.size)} → ${formatBytes(buffer.length)} (${metadata.width ?? "?"}×${metadata.height ?? "?"})`,
  );
}

function rebuildSourcesFromAssets(): number {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.log(`Папка с оригиналами не найдена: ${ASSETS_DIR}`);
    return 0;
  }

  const plants = JSON.parse(fs.readFileSync(PLANTS_JSON, "utf8")) as PlantRecord[];
  let copied = 0;

  for (const plant of plants) {
    if (!plant?.id) continue;
    const numberMatch = plant.id.match(/-(\d{3})$/);
    if (!numberMatch) continue;

    const assetPath = findAssetForNumber(numberMatch[1]!);
    if (!assetPath) continue;

    const targetPath = path.join(PLANTS_DIR, `${plantFileBase(plant.id)}.png`);
    fs.copyFileSync(assetPath, targetPath);
    copied += 1;
    console.log(`Источник: ${path.basename(assetPath)} → ${path.basename(targetPath)}`);
  }

  return copied;
}

async function main(): Promise<void> {
  const shouldRebuild = process.argv.includes("--rebuild");

  if (!fs.existsSync(PLANTS_DIR)) {
    fs.mkdirSync(PLANTS_DIR, { recursive: true });
  }

  if (shouldRebuild) {
    const copied = rebuildSourcesFromAssets();
    console.log(`Скопировано оригиналов: ${copied}`);
  }

  const sourceFiles = fs
    .readdirSync(PLANTS_DIR)
    .filter((file) => SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map((file) => path.join(PLANTS_DIR, file));

  if (sourceFiles.length > 0) {
    console.log(`Оптимизация ${sourceFiles.length} файлов (WebP q${WEBP_QUALITY}, до ${MAX_SIZE}px)...`);
    for (const filePath of sourceFiles) {
      await optimizeImage(filePath);
    }
  }

  if (shouldRebuild) {
    const plants = JSON.parse(fs.readFileSync(PLANTS_JSON, "utf8")) as PlantRecord[];
    const missingNumbers = new Set<string>();

    for (const plant of plants) {
      if (!plant?.id) continue;
      const numberMatch = plant.id.match(/-(\d{3})$/);
      if (!numberMatch || !plant.imageUrl) continue;
      if (!findAssetForNumber(numberMatch[1]!)) {
        missingNumbers.add(numberMatch[1]!);
      }
    }

    const reencodeFiles = fs
      .readdirSync(PLANTS_DIR)
      .filter((file) => file.endsWith(".webp"))
      .map((file) => path.join(PLANTS_DIR, file))
      .filter((filePath) => {
        const numberMatch = path.basename(filePath).match(/_(\d{3})\.webp$/);
        return numberMatch && missingNumbers.has(numberMatch[1]!);
      });

    if (reencodeFiles.length > 0) {
      console.log(`Перекодирование ${reencodeFiles.length} WebP без исходников PNG...`);
      for (const filePath of reencodeFiles) {
        try {
          await reencodeWebp(filePath);
        } catch (error) {
          console.warn(`Пропуск ${path.basename(filePath)}: файл занят другим процессом`);
        }
      }
    }
  }

  if (sourceFiles.length === 0 && !shouldRebuild) {
    console.log("В public/plants нет PNG/JPG для оптимизации. Запустите: npm run optimize:images -- --rebuild");
    return;
  }

  console.log("Готово.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
