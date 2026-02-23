import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CarCard, type CarCardData } from "~/components/car/CarCard";
import { SkeletonCard } from "~/components/car/SkeletonCard";
import { useFavoritesStore } from "~/stores/favorites";

export function GarageList() {
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const [cars, setCars] = useState<CarCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favoriteIds.length === 0) {
      setCars([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/cars?ids=${favoriteIds.join(",")}`)
      .then((res) => res.json())
      .then((data: { cars: CarCardData[] }) => {
        setCars(data.cars);
      })
      .catch(() => {
        setCars([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [favoriteIds]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: Math.min(favoriteIds.length, 6) }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (favoriteIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Heart className="text-muted-foreground mb-4 size-16" />
        <h2 className="mb-2 text-xl font-semibold">Sua garagem está vazia</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Favorite carros nos resultados ou nas páginas de detalhes para
          salvá-los aqui.
        </p>
        <Button asChild className="min-h-[44px]">
          <Link to="/results">Explorar carros</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}
