import { describe, it, expect } from 'vitest';
import { calculateMatch } from './match.server';

describe('calculateMatch', () => {
  const mockCar = {
    id: 'car-1',
    brand: 'TestBrand',
    model: 'TestModel',
    spec: {
      trunk_score: 9,
      wheelbase_score: 8,       // Comfort (partial) + Space (partial)
      ground_clearance_score: 8, // Comfort (partial)
      consumption_score: 9,      // Economy
      hp_score: 5,              // Performance (partial)
      acceleration_score: 5,    // Performance (partial)
    }
  };

  it('should return high match if car fits efficient profile', () => {
    const weights = {
      comfort: 10,
      economy: 90, // Heavily weighted on economy
      performance: 0,
      space: 10,
    };

    const result = calculateMatch(mockCar, weights);

    // Car has economy 9. Weight is 90%. Score should be high.
    expect(result.percentage).toBeGreaterThan(80);
    expect(result.categoryScores.economy).toBe(9);
  });

  it('should return low match if user wants performance', () => {
    const weights = {
      comfort: 10,
      economy: 10,
      performance: 80, // Wants performance
      space: 0,
    };

    const result = calculateMatch(mockCar, weights);

    // Car has performance ~5. Result should be around 50-60%.
    expect(result.percentage).toBeLessThan(70);
  });

  it('should assign correct badges', () => {
    const weights = { comfort: 25, economy: 25, performance: 25, space: 25 };
    const result = calculateMatch(mockCar, weights);

    expect(result.badges).toContain('Porta-malas Gigante'); // trunk_score 9
    expect(result.badges).toContain('Econômico'); // consumption_score 9
    expect(result.badges).toContain('Espaçoso'); // wheelbase 8
  });

  it('should handle missing spec gracefully', () => {
    const emptyCar = { id: 'bad', spec: null };
    const result = calculateMatch(emptyCar, { comfort: 50, economy: 50, performance: 0, space: 0 });
    
    expect(result.percentage).toBe(0);
  });
});
