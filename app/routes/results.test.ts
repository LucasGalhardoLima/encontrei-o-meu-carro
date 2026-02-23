import { describe, expect, it } from "vitest";
import { calculateMatch, type Weights } from "~/utils/match.server";

const mockCars = [
  {
    id: "car-1",
    spec: {
      trunk_score: 10,
      wheelbase_score: 8,
      ground_clearance_score: 6,
      consumption_score: 4,
      hp_score: 3,
      acceleration_score: 5,
    },
  },
  {
    id: "car-2",
    spec: {
      trunk_score: 3,
      wheelbase_score: 4,
      ground_clearance_score: 5,
      consumption_score: 9,
      hp_score: 8,
      acceleration_score: 7,
    },
  },
  {
    id: "car-3",
    spec: {
      trunk_score: 5,
      wheelbase_score: 5,
      ground_clearance_score: 5,
      consumption_score: 5,
      hp_score: 5,
      acceleration_score: 5,
    },
  },
];

describe("results loader match scoring logic", () => {
  it("sorts cars by match percentage descending when space weight is high", () => {
    const weights: Weights = {
      comfort: 10,
      economy: 10,
      performance: 10,
      space: 100,
    };

    const results = mockCars
      .map((car) => ({
        id: car.id,
        ...calculateMatch(car, weights),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Car-1 has trunk_score=10, wheelbase_score=8 → space=(10+8)/2=9
    // Car-3 has trunk_score=5, wheelbase_score=5 → space=5
    // Car-2 has trunk_score=3, wheelbase_score=4 → space=3.5
    expect(results[0].id).toBe("car-1");
    expect(results[results.length - 1].id).toBe("car-2");
  });

  it("sorts cars by match percentage descending when economy weight is high", () => {
    const weights: Weights = {
      comfort: 10,
      economy: 100,
      performance: 10,
      space: 10,
    };

    const results = mockCars
      .map((car) => ({
        id: car.id,
        ...calculateMatch(car, weights),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Car-2 has consumption_score=9 → economy=9
    expect(results[0].id).toBe("car-2");
  });

  it("returns 0% match for car without spec", () => {
    const weights: Weights = {
      comfort: 50,
      economy: 50,
      performance: 50,
      space: 50,
    };

    const result = calculateMatch({ id: "no-spec", spec: null }, weights);
    expect(result.percentage).toBe(0);
    expect(result.categoryScores.comfort).toBe(0);
  });

  it("handles equal weights producing balanced results", () => {
    const weights: Weights = {
      comfort: 50,
      economy: 50,
      performance: 50,
      space: 50,
    };

    const results = mockCars.map((car) => ({
      id: car.id,
      ...calculateMatch(car, weights),
    }));

    // All should have valid percentages
    results.forEach((r) => {
      expect(r.percentage).toBeGreaterThanOrEqual(0);
      expect(r.percentage).toBeLessThanOrEqual(100);
    });
  });
});
