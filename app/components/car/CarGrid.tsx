import { CarCard, type CarCardData } from "./CarCard";
import { SkeletonCard } from "./SkeletonCard";

export function CarGrid({
  cars,
  showMatch = false,
  loading = false,
}: {
  cars: CarCardData[];
  showMatch?: boolean;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-lg">
          Nenhum carro encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} showMatch={showMatch} />
      ))}
    </div>
  );
}
