/// <reference types="vitest" />
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const isVitest = process.env.VITEST === "true";
const ignoredEmptyChunks = new Set(["api.cars", "api.feedback", "resource.og"]);

export default defineConfig({
  plugins: isVitest
    ? [tsconfigPaths()]
    : [tailwindcss(), reactRouter(), tsconfigPaths()],
  build: {
    rollupOptions: {
      external: ["pdf-parse"],
      onwarn(warning, warn) {
        if (
          warning.code === "EMPTY_BUNDLE" &&
          warning.names?.every((name) => ignoredEmptyChunks.has(name))
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  test: {
    environment: "node",
    include: ["app/**/*.test.ts"],
  },
});
