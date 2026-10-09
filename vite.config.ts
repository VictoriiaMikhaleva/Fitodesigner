import { createReadStream, existsSync, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Connect, type ViteDevServer } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const unified = process.env.npm_lifecycle_event === "build:unified" || process.env.VITE_UNIFIED_DIST === "true";

function serveGardenPhotos(): { name: string; configureServer: (server: ViteDevServer) => void } {
  const assetsRoot = path.resolve(rootDir, "../garden_plants/assets");

  return {
    name: "serve-garden-photos",
    configureServer(server) {
      server.middlewares.use("/garden/assets", ((req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        const raw = decodeURIComponent((req.url ?? "/").split("?")[0]).replace(/^[/\\]+/, "");
        const filePath = path.resolve(assetsRoot, raw);
        const relative = path.relative(assetsRoot, filePath);
        if (relative.startsWith("..") || path.isAbsolute(relative)) {
          next();
          return;
        }
        if (!existsSync(filePath) || !statSync(filePath).isFile()) {
          next();
          return;
        }

        const extension = path.extname(filePath).toLowerCase();
        const types: Record<string, string> = {
          ".webp": "image/webp",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
        };
        res.setHeader("Content-Type", types[extension] ?? "application/octet-stream");
        createReadStream(filePath).pipe(res);
      }) as Connect.NextHandleFunction);
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: unified ? "/trainer/" : mode === "production" ? "/Fitodesigner/" : "/",
  define: {
    __TRAINER_UNIFIED__: JSON.stringify(unified),
  },
  plugins: [react(), tailwindcss(), serveGardenPhotos()],
}));
