import type { Route } from "./+types/api.cars";
import { prisma } from "~/utils/db.server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids") || "";

  if (!idsParam) {
    return Response.json({ cars: [] });
  }

  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter((id) => UUID_REGEX.test(id))
    .slice(0, 20);

  if (ids.length === 0) {
    return Response.json({ cars: [] });
  }

  const cars = await prisma.car.findMany({
    where: { id: { in: ids }, moderation_status: "approved" },
    include: { spec: true, images: { orderBy: { order: "asc" } } },
  });

  return Response.json({
    cars: cars.map((car) => ({
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price_avg: car.price_avg.toString(),
      type: car.type,
      imageUrl: car.imageUrl,
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
            trunk_score: car.spec.trunk_score,
            wheelbase_score: car.spec.wheelbase_score,
            ground_clearance_score: car.spec.ground_clearance_score,
            consumption_score: car.spec.consumption_score,
            hp_score: car.spec.hp_score,
            acceleration_score: car.spec.acceleration_score,
          }
        : null,
      images: car.images.map((img) => ({
        url: img.url,
        isPrimary: img.isPrimary,
      })),
    })),
  });
}
