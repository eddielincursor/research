import { defineConfig } from "vite"

// Relative base so the build works under GitHub Pages' /research/ path and when opened locally.
export default defineConfig({
  base: "./",
  server: { host: "0.0.0.0", port: 47322 },
  preview: { host: "0.0.0.0", port: 47323 },
})
