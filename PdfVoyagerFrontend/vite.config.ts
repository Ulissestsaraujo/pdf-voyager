import { defineConfig, normalizePath } from "vite";
import { createRequire } from "node:module";
import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
const require = createRequire(import.meta.url);
const cMapsDir = normalizePath(
  path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "cmaps")
);
const standardFontsDir = normalizePath(
  path.join(
    path.dirname(require.resolve("pdfjs-dist/package.json")),
    "standard_fonts"
  )
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: cMapsDir, dest: "" },
        { src: standardFontsDir, dest: "" },
      ],
    }),
  ],
  build: {
    outDir: "dist", // ✅ Set a consistent build output directory
    rollupOptions: {
      output: {
        manualChunks: {
          "pdf.worker": ["pdfjs-dist/build/pdf.worker.mjs"],
        },
      },
    },
  },
  server: {
    port: 3000, // ✅ Set a consistent local development port
  },
  preview: {
    port: 4173, // ✅ Ensure Azure Static Web Apps preview works
  },
  base: "/",
});
