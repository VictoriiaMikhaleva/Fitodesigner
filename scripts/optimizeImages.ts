import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLANTS_DIR = path.join(PROJECT_ROOT, "public", "plants");
const MAX_SIZE = 600;
const WEBP_QUALITY = 82;
const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function optimizeImage(filePath: string): Promise<void> {
  const ext = path.extname(filePath).toLowerCase();
  if (!SOURCE_EXTENSIONS.has(ext)) return;

  const baseName = path.basename(filePath, ext);
  const outputPath = path.join(PLANTS_DIR, `${baseName}.webp`);

  const inputStats = fs.statSync(filePath);
  const image = sharp(filePath).rotate();
  const metadata = await image.metadata();

  const buffer = await image
    .resize(MAX_SIZE, MAX_SIZE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  fs.writeFileSync(outputPath, buffer);

  if (filePath !== outputPath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  console.log(
    `${baseName}.webp: ${formatBytes(inputStats.size)} → ${formatBytes(buffer.length)} (${metadata.width ?? "?"}×${metadata.height ?? "?"})`,
  );
}

async function main(): Promise<void> {
  if (!fs.existsSync(PLANTS_DIR)) {
    fs.mkdirSync(PLANTS_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(PLANTS_DIR)
    .filter((file) => !file.endsWith(".tmp"))
    .filter((file) => SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map((file) => path.join(PLANTS_DIR, file));

  if (files.length === 0) {
    console.log("В public/plants нет изображений для оптимизации.");
    return;
  }

  console.log(`Оптимизация ${files.length} файлов...`);

  for (const filePath of files) {
    await optimizeImage(filePath);
  }

  console.log("Готово.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
