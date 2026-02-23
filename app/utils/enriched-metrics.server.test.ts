import { describe, expect, it } from "vitest";
import {
  calculateRange,
  calculateFuelStops,
  calculateSuitcaseCount,
  formatTripLabel,
  formatTrunkLabel,
  getEnrichedMetrics,
} from "./enriched-metrics.server";

describe("calculateRange", () => {
  it("returns km range from consumption and tank", () => {
    expect(calculateRange(12, 50)).toBe(600);
  });

  it("returns 0 when consumption is 0", () => {
    expect(calculateRange(0, 50)).toBe(0);
  });

  it("returns 0 when tank is 0", () => {
    expect(calculateRange(12, 0)).toBe(0);
  });

  it("rounds to nearest integer", () => {
    expect(calculateRange(11.3, 48)).toBe(542);
  });
});

describe("calculateFuelStops", () => {
  it("returns 0 when range covers 400km trip", () => {
    expect(calculateFuelStops(500)).toBe(0);
  });

  it("returns 0 when range exactly equals trip", () => {
    expect(calculateFuelStops(400)).toBe(0);
  });

  it("returns 1 when range is half the trip", () => {
    expect(calculateFuelStops(250)).toBe(1);
  });

  it("returns 2 when range covers ~1/3 of trip", () => {
    expect(calculateFuelStops(150)).toBe(2);
  });

  it("returns 0 when range is 0", () => {
    expect(calculateFuelStops(0)).toBe(0);
  });

  it("accepts custom trip distance", () => {
    expect(calculateFuelStops(300, 800)).toBe(2);
  });
});

describe("calculateSuitcaseCount", () => {
  it("returns 0 for 0L trunk", () => {
    expect(calculateSuitcaseCount(0)).toBe(0);
  });

  it("returns 1 for 65L trunk", () => {
    expect(calculateSuitcaseCount(65)).toBe(1);
  });

  it("returns 2 for 130L trunk", () => {
    expect(calculateSuitcaseCount(130)).toBe(2);
  });

  it("returns 9 for 600L trunk", () => {
    expect(calculateSuitcaseCount(600)).toBe(9);
  });

  it("floors partial suitcases", () => {
    expect(calculateSuitcaseCount(100)).toBe(1);
  });

  it("returns 0 for negative value", () => {
    expect(calculateSuitcaseCount(-10)).toBe(0);
  });
});

describe("formatTripLabel", () => {
  it("returns no-stop label for 0 stops", () => {
    expect(formatTripLabel(0)).toBe("Completa 400km sem parar");
  });

  it("returns singular for 1 stop", () => {
    expect(formatTripLabel(1)).toBe("Precisa de 1 parada em 400km");
  });

  it("returns plural for multiple stops", () => {
    expect(formatTripLabel(3)).toBe("Precisa de 3 paradas em 400km");
  });
});

describe("formatTrunkLabel", () => {
  it("returns compact label for 0 suitcases", () => {
    expect(formatTrunkLabel(0)).toBe("Porta-malas compacto");
  });

  it("returns singular for 1 suitcase", () => {
    expect(formatTrunkLabel(1)).toBe("Cabe 1 mala grande");
  });

  it("returns plural for multiple suitcases", () => {
    expect(formatTrunkLabel(5)).toBe("Cabe 5 malas grandes");
  });
});

describe("getEnrichedMetrics", () => {
  it("uses highway consumption when available", () => {
    const result = getEnrichedMetrics({
      fuel_consumption_city: 10,
      fuel_consumption_highway: 14,
      tank_capacity: 50,
      trunk_liters: 400,
    });
    expect(result.rangeKm).toBe(700);
    expect(result.fuelStops).toBe(0);
    expect(result.tripLabel).toBe("Completa 400km sem parar");
  });

  it("falls back to city consumption", () => {
    const result = getEnrichedMetrics({
      fuel_consumption_city: 10,
      tank_capacity: 30,
      trunk_liters: 300,
    });
    expect(result.rangeKm).toBe(300);
    expect(result.fuelStops).toBe(1);
  });

  it("handles electric car with no tank", () => {
    const result = getEnrichedMetrics({
      fuel_consumption_city: 20,
      tank_capacity: 0,
      trunk_liters: 345,
    });
    expect(result.rangeKm).toBe(0);
    expect(result.fuelStops).toBe(0);
    expect(result.suitcaseCount).toBe(5);
  });
});
