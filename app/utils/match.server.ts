export type Weights = {
  comfort: number;
  economy: number;
  performance: number;
  space: number;
};

export type MatchResult = {
  percentage: number;
  categoryScores: {
    comfort: number;
    economy: number;
    performance: number;
    space: number;
  };
  badges: string[];
};

export function calculateMatch(car: any, weights: Weights): MatchResult {
  if (!car.spec) {
    return {
      percentage: 0,
      categoryScores: { comfort: 0, economy: 0, performance: 0, space: 0 },
      badges: [],
    };
  }

  const s = car.spec;

  // 1. Calculate Category Scores (0-10) with safety defaults
  const score_comfort = ((s.wheelbase_score ?? 0) + (s.ground_clearance_score ?? 0)) / 2;
  const score_economy = s.consumption_score ?? 0;
  const score_performance = ((s.hp_score ?? 0) + (s.acceleration_score ?? 0)) / 2;
  const score_space = ((s.trunk_score ?? 0) + (s.wheelbase_score ?? 0)) / 2;

  // 2. Calculate Weighted Average
  const totalWeight = (weights.comfort || 0) + (weights.economy || 0) + (weights.performance || 0) + (weights.space || 0);
  
  let percentage = 0;
  if (totalWeight > 0) {
    const weightedSum =
      score_comfort * (weights.comfort || 0) +
      score_economy * (weights.economy || 0) +
      score_performance * (weights.performance || 0) +
      score_space * (weights.space || 0);

    percentage = Math.round((weightedSum / totalWeight) * 10); 
  }

  if (isNaN(percentage)) {
    console.error("Match Engine ERROR: Result is NaN", { carId: car.id, scores: { score_comfort, score_economy, score_performance, score_space }, weights, totalWeight });
    percentage = 0;
  }

  // 3. Generate Badges (Logic for "Why")
  const badges: string[] = [];
  
  // Logic: Badge if Attribute Score is High (>8) AND User cares about it (>25% relative weight or high absolute value?)
  // Let's use simple logic: If score >= 8
  if (s.trunk_score >= 9) badges.push("Porta-malas Gigante");
  if (s.consumption_score >= 8) badges.push("Econômico");
  if (s.hp_score >= 8) badges.push("Potente");
  if (s.wheelbase_score >= 8) badges.push("Espaçoso");
  if (score_comfort >= 8) badges.push("Selo Conforto");

  // Dynamic Badges based on User Match (only if user actually asked for it)
  // e.g., "Match de Economia" if User.Economy weight is high AND Car.Economy score is high
  const maxWeight = Math.max(weights.comfort, weights.economy, weights.performance, weights.space);
  
  if (weights.economy === maxWeight && score_economy >= 8) badges.push("🎯 Top Economia");
  if (weights.space === maxWeight && score_space >= 8) badges.push("🎯 Top Espaço");
  // if (weights.performance === maxWeight && score_performance >= 8) badges.push("🎯 Top Performance");

  return {
    percentage,
    categoryScores: {
      comfort: score_comfort,
      economy: score_economy,
      performance: score_performance,
      space: score_space,
    },
    badges: [...new Set(badges)], // Unique
  };
}
