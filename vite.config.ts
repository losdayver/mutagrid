import { defineConfig } from "vite";

export default defineConfig({
  root: "src/dev",
  base: "/",

  build: {
    outDir: "dist/dev",
    target: "esnext",
    sourcemap: true,
    minify: true,
  },
});
