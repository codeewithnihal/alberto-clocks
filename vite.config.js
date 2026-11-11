import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "/" ensures clean root-absolute asset paths so direct visits and refreshes
// on nested routes (such as /collections/luxury or /about) resolve correctly.
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 700,
  },
});
