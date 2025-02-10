import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
