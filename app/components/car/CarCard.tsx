import { Link } from "react-router";
import { Heart } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { toPriceNumber } from "~/utils/price";
import { useFavoritesStore } from "~/stores/favorites";
import { useComparisonStore } from "~/stores/comparison";

export type CarCardData = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price_avg: number | string | { toString(): string };
  type: string;
  imageUrl?: string | null;
  matchPercentage?: number;
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CarCard({
  car,
  showMatch = false,
}: {
  car: CarCardData;
  showMatch?: boolean;
}) {
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.favoriteIds.includes(car.id));
  const toggleCar = useComparisonStore((s) => s.toggleCar);
  const isComparing = useComparisonStore((s) =>
    s.selectedCarIds.includes(car.id)
  );
  const price = toPriceNumber(car.price_avg);

  return (
    <Card className="group relative overflow-hidden p-0">
      {/* Match badge */}
      {showMatch && car.matchPercentage != null && (
        <Badge
          className={cn(
            "absolute top-2 left-2 z-10",
            car.matchPercentage >= 75
              ? "bg-green-600"
              : car.matchPercentage >= 50
                ? "bg-yellow-500 text-black"
                : "bg-red-500"
          )}
        >
          {car.matchPercentage}% match
        </Badge>
      )}

      {/* Image */}
      <Link to={`/carros/${car.id}`} className="block">
        <div className="bg-muted aspect-[16/10] w-full overflow-hidden">
          <img
            src={car.imageUrl || "/images/placeholder.png"}
            alt={`${car.brand} ${car.model} ${car.year}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <CardContent className="space-y-2 p-4">
        {/* Title */}
        <Link to={`/carros/${car.id}`} className="block">
          <h3 className="truncate text-sm font-semibold">
            {car.brand} {car.model}
          </h3>
          <p className="text-muted-foreground text-xs">
            {car.year} &middot; {car.type}
          </p>
        </Link>

        {/* Price + Actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-primary text-sm font-bold">
            {formatBRL(price)}
          </span>

          <div className="flex items-center gap-1">
            {/* Compare checkbox */}
            <label className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center">
              <Checkbox
                checked={isComparing}
                onCheckedChange={() => toggleCar(car.id)}
                aria-label={`Comparar ${car.brand} ${car.model}`}
              />
            </label>

            {/* Favorite button */}
            <Button
              variant="ghost"
              size="icon"
              className="size-11"
              onClick={() => toggleFavorite(car.id)}
              aria-label={
                isFavorite
                  ? `Remover ${car.brand} ${car.model} dos favoritos`
                  : `Adicionar ${car.brand} ${car.model} aos favoritos`
              }
            >
              <Heart
                className={cn(
                  "size-5 transition-colors",
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                )}
              />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
