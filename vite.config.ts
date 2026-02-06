/// <reference types="vitest" />
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const isVitest = process.env.VITEST === "true";

export default defineConfig({
  plugins: isVitest
    ? [tsconfigPaths()]
    : [tailwindcss(), reactRouter(), tsconfigPaths()],
  test: {
    environment: "node",
    include: ["app/**/*.test.ts"],
  },
});
