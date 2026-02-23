import { Fuel, Luggage, Route, Gauge } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import type { EnrichedMetrics as EnrichedMetricsType } from "~/utils/enriched-metrics.server";

const METRICS_CONFIG = [
  {
    key: "tripLabel" as const,
    icon: Route,
    label: "Viagem de 400km",
  },
  {
    key: "trunkLabel" as const,
    icon: Luggage,
    label: "Porta-malas",
  },
  {
    key: "rangeKm" as const,
    icon: Fuel,
    label: "Autonomia",
    format: (v: number) => (v > 0 ? `${v} km` : "Dados indisponíveis"),
  },
] as const;

export function EnrichedMetrics({
  metrics,
  fuelConsumption,
}: {
  metrics: EnrichedMetricsType;
  fuelConsumption?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {METRICS_CONFIG.map((config) => {
        const value = metrics[config.key];
        const displayValue =
          "format" in config && typeof value === "number"
            ? config.format(value)
            : String(value);

        return (
          <Card key={config.key} className="py-4">
            <CardContent className="flex items-start gap-3 px-4">
              <config.icon className="text-primary mt-0.5 size-5 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">{config.label}</p>
                <p className="text-sm font-semibold">{displayValue}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {fuelConsumption != null && fuelConsumption > 0 && (
        <Card className="py-4">
          <CardContent className="flex items-start gap-3 px-4">
            <Gauge className="text-primary mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Consumo cidade</p>
              <p className="text-sm font-semibold">
                {fuelConsumption.toFixed(1)} km/L
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
