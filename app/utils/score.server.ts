export type RawSpec = {
  trunk_liters: number;
  wheelbase: number;
  ground_clearance: number;
  fuel_consumption_city: number;
  hp?: number;
  acceleration?: number;
};

// Helper to calculate scores based on raw specs
export function calculateScores(spec: RawSpec) {
  // Trunk: >500L = 10, <250L = 2
  let trunk_score = Math.min(10, Math.max(1, Math.round(spec.trunk_liters / 55))); 
  if (spec.trunk_liters >= 550) trunk_score = 10;
  if (spec.trunk_liters <= 280) trunk_score = 3;

  // Consumption: >14km/l = 10, <7km/l = 2
  let consumption_score = Math.min(10, Math.max(1, Math.round(spec.fuel_consumption_city - 4)));
  if (spec.fuel_consumption_city >= 14) consumption_score = 10;
  
  // Wheelbase: >2.70 = 10, <2.50 = 4
  let wheelbase_score = Math.min(10, Math.max(1, Math.round((spec.wheelbase - 2.45) * 25)));
  
  // Ground Clearance: >200mm = 10
  let ground_clearance_score = Math.min(10, Math.max(1, Math.round((spec.ground_clearance - 150) / 5)));

  // HP: >180 = 10, <100 = 3
  let hp_score = 5;
  if (spec.hp) {
    hp_score = Math.min(10, Math.max(1, Math.round((spec.hp - 90) / 10)));
  }

  // Acceleration: <8s = 10, >14s = 2 (Inverted logic)
  let acceleration_score = 5;
  if (spec.acceleration) {
    acceleration_score = Math.min(10, Math.max(1, Math.round(15 - spec.acceleration)));
  }

  return {
    trunk_score,
    wheelbase_score,
    ground_clearance_score,
    consumption_score,
    hp_score,
    acceleration_score
  };
}
