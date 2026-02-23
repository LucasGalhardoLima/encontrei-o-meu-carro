const REFERENCE_TRIP_KM = 400;

const SUITCASE_LITERS = 65;

export type EnrichedMetrics = {
  rangeKm: number;
  fuelStops: number;
  suitcaseCount: number;
  tripLabel: string;
  trunkLabel: string;
};

type SpecInput = {
  fuel_consumption_city: number;
  tank_capacity: number;
  trunk_liters: number;
  fuel_consumption_highway?: number | null;
};

/** Range in km using highway consumption when available, city otherwise */
export function calculateRange(
  fuelConsumption: number,
  tankCapacity: number
): number {
  if (fuelConsumption <= 0 || tankCapacity <= 0) return 0;
  return Math.round(fuelConsumption * tankCapacity);
}

/** Number of fuel stops needed for a 400km reference trip */
export function calculateFuelStops(
  rangeKm: number,
  tripDistance: number = REFERENCE_TRIP_KM
): number {
  if (rangeKm <= 0) return 0;
  if (rangeKm >= tripDistance) return 0;
  return Math.ceil(tripDistance / rangeKm) - 1;
}

/** How many large suitcases (65L each) fit in the trunk */
export function calculateSuitcaseCount(trunkLiters: number): number {
  if (trunkLiters <= 0) return 0;
  return Math.floor(trunkLiters / SUITCASE_LITERS);
}

/** Label in pt-BR describing fuel stops for 400km trip */
export function formatTripLabel(fuelStops: number): string {
  if (fuelStops <= 0) return "Completa 400km sem parar";
  if (fuelStops === 1) return "Precisa de 1 parada em 400km";
  return `Precisa de ${fuelStops} paradas em 400km`;
}

/** Label in pt-BR describing trunk capacity in suitcases */
export function formatTrunkLabel(suitcaseCount: number): string {
  if (suitcaseCount <= 0) return "Porta-malas compacto";
  if (suitcaseCount === 1) return "Cabe 1 mala grande";
  return `Cabe ${suitcaseCount} malas grandes`;
}

/** Compute all enriched metrics for a car spec */
export function getEnrichedMetrics(spec: SpecInput): EnrichedMetrics {
  const consumption = spec.fuel_consumption_highway ?? spec.fuel_consumption_city;
  const rangeKm = calculateRange(consumption, spec.tank_capacity);
  const fuelStops = calculateFuelStops(rangeKm);
  const suitcaseCount = calculateSuitcaseCount(spec.trunk_liters);

  return {
    rangeKm,
    fuelStops,
    suitcaseCount,
    tripLabel: formatTripLabel(fuelStops),
    trunkLabel: formatTrunkLabel(suitcaseCount),
  };
}
