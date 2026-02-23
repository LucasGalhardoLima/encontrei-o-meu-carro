import { useLoaderData } from "react-router";
import type { Route } from "./+types/car-detail";
import { prisma } from "~/utils/db.server";
import { getEnrichedMetrics } from "~/utils/enriched-metrics.server";
import { calculateMatch, type Weights } from "~/utils/match.server";
import { toPriceNumber } from "~/utils/price";
import { ImageGallery } from "~/components/car/ImageGallery";
import { EnrichedMetrics } from "~/components/car/EnrichedMetrics";
import { SpecTable } from "~/components/car/SpecTable";
import { MarketplaceLinks } from "~/components/car/MarketplaceLinks";
import { RadarChart } from "~/components/ui/RadarChart";
import { MatchBadge } from "~/components/car/MatchBadge";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Heart, GitCompareArrows, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { useFavoritesStore } from "~/stores/favorites";
import { useComparisonStore } from "~/stores/comparison";
import { cn } from "~/lib/utils";

export async function loader({ params, request }: Route.LoaderArgs) {
  const car = await prisma.car.findFirst({
    where: { id: params.id, moderation_status: "approved" },
    include: { spec: true, images: { orderBy: { order: "asc" } } },
  });

  if (!car) {
    throw new Response("Carro não encontrado", { status: 404 });
  }

  const enrichedMetrics = car.spec
    ? getEnrichedMetrics({
        fuel_consumption_city: car.spec.fuel_consumption_city,
        fuel_consumption_highway: car.spec.fuel_consumption_highway,
        tank_capacity: car.spec.tank_capacity,
        trunk_liters: car.spec.trunk_liters,
      })
    : null;

  // Optional match if weights in URL
  const url = new URL(request.url);
  let matchResult = null;
  const wComfort = url.searchParams.get("w_comfort");
  if (wComfort) {
    const weights: Weights = {
      comfort: Number(wComfort) || 50,
      economy: Number(url.searchParams.get("w_economy")) || 50,
      performance: Number(url.searchParams.get("w_performance")) || 50,
      space: Number(url.searchParams.get("w_space")) || 50,
    };
    matchResult = calculateMatch(car, weights);
  }

  // Build images list: use CarImage records, fall back to imageUrl
  const images =
    car.images.length > 0
      ? car.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary }))
      : car.imageUrl
        ? [{ url: car.imageUrl, isPrimary: true }]
        : [];

  return {
    car: {
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price_avg: car.price_avg.toString(),
      type: car.type,
    },
    spec: car.spec
      ? {
          trunk_liters: car.spec.trunk_liters,
          tank_capacity: car.spec.tank_capacity,
          wheelbase: car.spec.wheelbase,
          ground_clearance: car.spec.ground_clearance,
          fuel_consumption_city: car.spec.fuel_consumption_city,
          fuel_consumption_highway: car.spec.fuel_consumption_highway,
          fuel_type: car.spec.fuel_type,
          transmission: car.spec.transmission,
          hp: car.spec.hp,
          acceleration: car.spec.acceleration,
        }
      : null,
    categoryScores: matchResult?.categoryScores ?? null,
    matchPercentage: matchResult?.percentage ?? null,
    badges: matchResult?.badges ?? [],
    enrichedMetrics,
    images,
  };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.car) return [{ title: "Carro não encontrado" }];
  const { car } = data;
  const title = `${car.brand} ${car.model} ${car.year} — Encontre o Meu Carro`;
  return [
    { title },
    {
      name: "description",
      content: `Veja detalhes, especificações e dados enriquecidos do ${car.brand} ${car.model} ${car.year}.`,
    },
  ];
}

export default function CarDetailPage() {
  const data = useLoaderData<typeof loader>();
  const { car, spec, enrichedMetrics, images, categoryScores, matchPercentage, badges } = data;

  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) =>
    s.favoriteIds.includes(car.id)
  );
  const toggleCar = useComparisonStore((s) => s.toggleCar);
  const isComparing = useComparisonStore((s) =>
    s.selectedCarIds.includes(car.id)
  );

  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(car.price_avg));

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        to="/results"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar aos resultados
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Images */}
        <ImageGallery
          images={images}
          alt={`${car.brand} ${car.model} ${car.year}`}
        />

        {/* Right: Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {car.brand} {car.model}
                </h1>
                <p className="text-muted-foreground">
                  {car.year} &middot; {car.type}
                </p>
              </div>
              {matchPercentage != null && (
                <MatchBadge percentage={matchPercentage} size="lg" />
              )}
            </div>
            <p className="text-primary mt-2 text-2xl font-bold">{price}</p>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {badges.map((badge) => (
                  <Badge key={badge} variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant={isComparing ? "default" : "outline"}
              className="min-h-[44px] flex-1 gap-2"
              onClick={() => toggleCar(car.id)}
            >
              <GitCompareArrows className="size-4" />
              {isComparing ? "Comparando" : "Comparar"}
            </Button>
            <Button
              variant="outline"
              className="min-h-[44px] flex-1 gap-2"
              onClick={() => toggleFavorite(car.id)}
            >
              <Heart
                className={cn(
                  "size-4",
                  isFavorite && "fill-red-500 text-red-500"
                )}
              />
              {isFavorite ? "Favoritado" : "Favoritar"}
            </Button>
          </div>

          {/* Radar chart */}
          {categoryScores && (
            <div className="flex justify-center">
              <RadarChart scores={categoryScores} />
            </div>
          )}

          {/* Enriched Metrics */}
          {enrichedMetrics && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">
                Dados enriquecidos
              </h2>
              <EnrichedMetrics
                metrics={enrichedMetrics}
                fuelConsumption={spec?.fuel_consumption_city}
              />
            </div>
          )}
        </div>
      </div>

      {/* Full specs */}
      {spec && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Ficha técnica</h2>
          <SpecTable spec={spec} />
        </div>
      )}

      {/* Marketplace links */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Encontrar para comprar</h2>
        <MarketplaceLinks brand={car.brand} model={car.model} />
      </div>
    </div>
  );
}
