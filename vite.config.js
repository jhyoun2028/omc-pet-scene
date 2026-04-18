import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `npm run dev`  → Vite dev server, uses index.html as entry (standalone dev).
// `npm run build` → builds the webview bundle that the VS Code extension and
// the Electron overlay load via a local <script src>. Output lives in media/
// so .vscodeignore's dist/** exclusion leaves it alone.
export default defineConfig({
  plugins: [react()],
  // public/ is copied verbatim to outDir on build; that's where the static
  // HTML shell for the Electron overlay lives (media/omc-overlay.html).
  publicDir: "public",
  build: {
    outDir: "media",
    emptyOutDir: true,
    rollupOptions: {
      input: "main.jsx",
      output: {
        format: "iife",
        entryFileNames: "omc-webview.js",
        assetFileNames: "omc-webview.[ext]",
      },
    },
    minify: true,
    sourcemap: false,
    target: "es2019",
  },
});
