import { resolve } from "node:path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// The report page lives in src/report and builds to one self-contained index.html.
// Publish with `npm run build` (scripts/build-site.mjs), which builds into docs/<stage id>/.
// A plain `vite build` goes to build-preview/, never docs/, so it can't overwrite a stage.
export default defineConfig({
  root: resolve(import.meta.dirname, "src/report"),
  base: "./",
  plugins: [viteSingleFile()],
  define: {
    __SITE_STAGE_TITLE__: JSON.stringify(process.env.SITE_STAGE_TITLE ?? "Two-sector model (preview build)"),
  },
  build: {
    outDir: resolve(import.meta.dirname, "build-preview"),
    emptyOutDir: true,
  },
  server: { host: "0.0.0.0", port: 8000, strictPort: true },
  preview: { host: "0.0.0.0", port: 8000, strictPort: true },
});
