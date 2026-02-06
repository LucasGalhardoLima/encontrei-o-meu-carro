function toFiniteNumber(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : value && typeof value === "object" && "toString" in value
          ? Number(value.toString())
          : NaN;

  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number, decimals: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatLiters(value: unknown) {
  const n = toFiniteNumber(value);
  return n === null ? "-" : `${Math.round(n)} L`;
}

export function formatKmPerLiter(value: unknown) {
  const n = toFiniteNumber(value);
  return n === null ? "-" : `${formatNumber(n, 1)} km/L`;
}

export function formatCv(value: unknown) {
  const n = toFiniteNumber(value);
  return n === null ? "-" : `${Math.round(n)} cv`;
}

export function formatSeconds(value: unknown) {
  const n = toFiniteNumber(value);
  return n === null ? "-" : `${formatNumber(n, 1)}s`;
}

export function formatMeters(value: unknown) {
  const n = toFiniteNumber(value);
  return n === null ? "-" : `${formatNumber(n, 2)} m`;
}
