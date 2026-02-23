import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useComparisonStore } from "~/stores/comparison";
import { ComparisonHeader } from "~/components/comparison/ComparisonHeader";
import { ComparisonTable } from "~/components/comparison/ComparisonTable";
import { ComparisonRadar } from "~/components/comparison/ComparisonRadar";
import { EmptyComparison } from "~/components/comparison/EmptyComparison";
import { Skeleton } from "~/components/ui/skeleton";

type CarSpec = {
  trunk_liters: number;
  tank_capacity: number;
  wheelbase: number;
  ground_clearance: number;
  fuel_consumption_city: number;
  fuel_consumption_highway?: number | null;
  fuel_type: string;
  transmission: string;
  hp?: number | null;
  acceleration?: number | null;
  trunk_score?: number | null;
  wheelbase_score?: number | null;
  ground_clearance_score?: number | null;
  consumption_score?: number | null;
  hp_score?: number | null;
  acceleration_score?: number | null;
};

type CarData = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price_avg: string;
  type: string;
  imageUrl?: string | null;
  spec: CarSpec | null;
};

export const meta = () => [{ title: "Comparar Carros — Encontre o Meu Carro" }];

export default function ComparePage() {
  const selectedCarIds = useComparisonStore((s) => s.selectedCarIds);
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCarIds.length === 0) {
      setCars([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/cars?ids=${selectedCarIds.join(",")}`)
      .then((res) => res.json())
      .then((data: { cars: CarData[] }) => {
        // Maintain the order from selectedCarIds
        const carMap = new Map(data.cars.map((c) => [c.id, c]));
        const ordered = selectedCarIds
          .map((id) => carMap.get(id))
          .filter((c): c is CarData => c != null);
        setCars(ordered);
      })
      .catch(() => {
        setCars([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCarIds]);

  if (!loading && selectedCarIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <EmptyComparison />
      </div>
    );
  }

  // Build radar data from spec scores
  const carsWithScores = cars
    .filter((c) => c.spec)
    .map((c) => ({
      id: c.id,
      brand: c.brand,
      model: c.model,
      scores: {
        comfort:
          ((c.spec!.wheelbase_score ?? 0) + (c.spec!.ground_clearance_score ?? 0)) / 2,
        economy: c.spec!.consumption_score ?? 0,
        performance:
          ((c.spec!.hp_score ?? 0) + (c.spec!.acceleration_score ?? 0)) / 2,
        space:
          ((c.spec!.trunk_score ?? 0) + (c.spec!.wheelbase_score ?? 0)) / 2,
      },
    }));

  return (
    <div className="container mx-auto px-4 py-6">
      <Link
        to="/results"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar aos resultados
      </Link>

      <div className="mt-4 space-y-8">
        <ComparisonHeader count={selectedCarIds.length} />

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : cars.length < 2 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
            <p>Selecione pelo menos 2 carros para comparar.</p>
            <Link
              to="/results"
              className="text-primary mt-2 inline-block text-sm underline"
            >
              Ir para resultados
            </Link>
          </div>
        ) : (
          <>
            {/* Radar overlay comparison */}
            {carsWithScores.length >= 2 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold">
                  Visão geral por categoria
                </h2>
                <ComparisonRadar cars={carsWithScores} />
              </section>
            )}

            {/* Specs table */}
            <section>
              <h2 className="mb-4 text-lg font-semibold">
                Comparação detalhada
              </h2>
              <ComparisonTable cars={cars} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
