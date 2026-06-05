import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  // GitHub Pages: https://victoriiamikhaleva.github.io/Fitodesigner/
  base: mode === "production" ? "/Fitodesigner/" : "/",
  plugins: [react(), tailwindcss()],
}));
