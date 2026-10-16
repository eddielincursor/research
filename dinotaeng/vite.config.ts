import { defineConfig } from "vite"

// Relative base so the build works under GitHub Pages' /research/dinotaeng/ path and when opened locally.
export default defineConfig({
  base: "./",
  server: { host: "0.0.0.0", port: 47326 },
  preview: { host: "0.0.0.0", port: 47327 },
})
