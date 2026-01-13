import { describe, it, expect } from 'vitest';
import { calculateScores } from './score.server';

describe('calculateScores', () => {
  it('should calculate scores for a balanced car correctly', () => {
    const rawSpec = {
      trunk_liters: 437,
      wheelbase: 2.61,
      ground_clearance: 190,
      fuel_consumption_city: 11.4,
      hp: 126,
      acceleration: 11.2,
    };

    const scores = calculateScores(rawSpec);

    // Manual checks based on logic:
    // Trunk: 437 / 55 ~= 7.9 -> 8
    // Wheelbase: (2.61 - 2.45) * 25 = 0.16 * 25 = 4
    // Clearance: (190 - 150) / 5 = 40 / 5 = 8
    // Consumption: 11.4 - 4 = 7.4 -> 7
    // HP: (126 - 90) / 10 = 3.6 -> 4
    // Acceleration: 15 - 11.2 = 3.8 -> 4 (logic min 10, max 1)

    expect(scores.trunk_score).toBeGreaterThan(6);
    expect(scores.ground_clearance_score).toBeGreaterThan(6);
    expect(scores.consumption_score).toBeGreaterThan(5);
  });

  it('should cap max scores at 10', () => {
    const superCar = {
      trunk_liters: 600, // > 550 -> 10
      wheelbase: 3.0,    // > 2.70 -> 10
      ground_clearance: 250, // > 200 -> 10
      fuel_consumption_city: 20, // > 14 -> 10
      hp: 500, // > 180 -> 10
      acceleration: 3.0, // < 8 -> 10
    };

    const scores = calculateScores(superCar);

    expect(scores.trunk_score).toBe(10);
    expect(scores.wheelbase_score).toBe(10);
    expect(scores.ground_clearance_score).toBe(10);
    expect(scores.consumption_score).toBe(10);
    expect(scores.hp_score).toBe(10);
    expect(scores.acceleration_score).toBe(10);
  });

  it('should handle minimum scores correctly', () => {
    const badCar = {
      trunk_liters: 100, // < 250 -> 3 (special rule) or calc
      wheelbase: 2.0, 
      ground_clearance: 100, 
      fuel_consumption_city: 2, 
      hp: 50, 
      acceleration: 20, 
    };

    const scores = calculateScores(badCar);

    expect(scores.trunk_score).toBeLessThanOrEqual(3);
    expect(scores.consumption_score).toBeLessThanOrEqual(2); 
  });
});
