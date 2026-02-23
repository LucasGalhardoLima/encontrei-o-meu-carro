import { describe, expect, it } from "vitest";
import { z } from "zod";

const EnrichedSpecsSchema = z.object({
  tank_capacity: z.number().min(0).default(0),
  trunk_liters: z.number().min(0).default(0),
  wheelbase: z.number().min(0).default(0),
  ground_clearance: z.number().min(0).default(0),
  hp: z.number().min(0).nullable().default(null),
  acceleration: z.number().min(0).nullable().default(null),
  transmission: z.string().default("Automático"),
  body_type: z.string().default("Hatch"),
});

describe("llm enrichment", () => {
  it("parses valid structured output", () => {
    const response = {
      tank_capacity: 48,
      trunk_liters: 600,
      wheelbase: 2.53,
      ground_clearance: 192,
      hp: 130,
      acceleration: 8.1,
      transmission: "CVT",
      body_type: "SUV",
    };

    const result = EnrichedSpecsSchema.parse(response);
    expect(result.tank_capacity).toBe(48);
    expect(result.trunk_liters).toBe(600);
    expect(result.transmission).toBe("CVT");
    expect(result.body_type).toBe("SUV");
  });

  it("uses defaults for missing fields", () => {
    const response = {
      tank_capacity: 50,
      trunk_liters: 300,
    };

    const result = EnrichedSpecsSchema.parse(response);
    expect(result.wheelbase).toBe(0);
    expect(result.ground_clearance).toBe(0);
    expect(result.hp).toBeNull();
    expect(result.acceleration).toBeNull();
    expect(result.transmission).toBe("Automático");
    expect(result.body_type).toBe("Hatch");
  });

  it("rejects negative values", () => {
    const response = {
      tank_capacity: -10,
      trunk_liters: 300,
    };

    expect(() => EnrichedSpecsSchema.parse(response)).toThrow();
  });

  it("handles null hp and acceleration", () => {
    const response = {
      tank_capacity: 50,
      trunk_liters: 400,
      hp: null,
      acceleration: null,
    };

    const result = EnrichedSpecsSchema.parse(response);
    expect(result.hp).toBeNull();
    expect(result.acceleration).toBeNull();
  });
});
