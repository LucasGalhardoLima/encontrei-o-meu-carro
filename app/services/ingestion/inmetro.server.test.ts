import { describe, expect, it } from "vitest";
import { matchInmetroEntry, type InmetroEntry } from "./inmetro.server";

const SAMPLE_ENTRIES: InmetroEntry[] = [
  {
    brand: "FIAT",
    model: "ARGO 1.0",
    fuel_consumption_city: 13.5,
    fuel_consumption_highway: 14.8,
    fuel_type: "Flex",
  },
  {
    brand: "VOLKSWAGEN",
    model: "POLO 1.0 TSI",
    fuel_consumption_city: 13.0,
    fuel_consumption_highway: 14.5,
    fuel_type: "Flex",
  },
  {
    brand: "HYUNDAI",
    model: "HB20 1.0",
    fuel_consumption_city: 13.3,
    fuel_consumption_highway: 14.0,
    fuel_type: "Flex",
  },
];

describe("inmetro parser", () => {
  describe("matchInmetroEntry", () => {
    it("matches brand and model substring", () => {
      const result = matchInmetroEntry("Fiat", "Argo", SAMPLE_ENTRIES);
      expect(result).not.toBeNull();
      expect(result!.brand).toBe("FIAT");
      expect(result!.fuel_consumption_city).toBe(13.5);
    });

    it("matches case-insensitively", () => {
      const result = matchInmetroEntry(
        "volkswagen",
        "polo",
        SAMPLE_ENTRIES
      );
      expect(result).not.toBeNull();
      expect(result!.fuel_consumption_highway).toBe(14.5);
    });

    it("returns null for non-existent car", () => {
      const result = matchInmetroEntry("BMW", "X1", SAMPLE_ENTRIES);
      expect(result).toBeNull();
    });

    it("handles empty entries array", () => {
      const result = matchInmetroEntry("Fiat", "Argo", []);
      expect(result).toBeNull();
    });
  });
});
