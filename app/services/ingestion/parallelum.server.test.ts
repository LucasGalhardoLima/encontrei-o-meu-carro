import { describe, expect, it } from "vitest";
import { isRecentYear } from "./parallelum.server";

describe("parallelum client", () => {
  describe("isRecentYear", () => {
    it("accepts 2024 year code", () => {
      expect(isRecentYear("2024-1")).toBe(true);
    });

    it("accepts 2025 year code", () => {
      expect(isRecentYear("2025-1")).toBe(true);
    });

    it("accepts 32000 (zero-km) code", () => {
      expect(isRecentYear("32000-1")).toBe(true);
    });

    it("rejects 2023 year code", () => {
      expect(isRecentYear("2023-1")).toBe(false);
    });

    it("rejects 2020 year code", () => {
      expect(isRecentYear("2020-3")).toBe(false);
    });
  });
});
