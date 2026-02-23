import { describe, expect, it } from "vitest";
import { getEnrichedMetrics } from "~/utils/enriched-metrics.server";
import {
  getWebmotorsUrl,
  getOlxUrl,
  getMercadoLivreUrl,
} from "~/utils/deep-links";

describe("car detail loader logic", () => {
  it("enrichedMetrics matches getEnrichedMetrics output", () => {
    const spec = {
      fuel_consumption_city: 11.3,
      fuel_consumption_highway: 14.5,
      tank_capacity: 48,
      trunk_liters: 600,
    };

    const result = getEnrichedMetrics(spec);
    expect(result.rangeKm).toBe(696);
    expect(result.fuelStops).toBe(0);
    expect(result.tripLabel).toBe("Completa 400km sem parar");
    expect(result.suitcaseCount).toBe(9);
    expect(result.trunkLabel).toBe("Cabe 9 malas grandes");
  });

  it("generates valid marketplace links", () => {
    const brand = "Fiat";
    const model = "Fastback";

    const webmotors = getWebmotorsUrl(brand, model);
    const olx = getOlxUrl(brand, model);
    const ml = getMercadoLivreUrl(brand, model);

    expect(webmotors).toContain("webmotors.com.br");
    expect(webmotors).toContain("fiat");
    expect(webmotors).toContain("fastback");

    expect(olx).toContain("olx.com.br");
    expect(ml).toContain("mercadolivre.com.br");
  });

  it("handles car with no highway consumption", () => {
    const spec = {
      fuel_consumption_city: 13.5,
      tank_capacity: 52,
      trunk_liters: 300,
    };

    const result = getEnrichedMetrics(spec);
    // Falls back to city: 13.5 * 52 = 702
    expect(result.rangeKm).toBe(702);
    expect(result.fuelStops).toBe(0);
  });
});
