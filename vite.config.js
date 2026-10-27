import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" keeps every asset URL relative, so the built site works from any
// folder or sub-path of a static host. Routing is hash based (#/collections),
// so no server-side rewrite rules are needed either.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 700,
  },
});
