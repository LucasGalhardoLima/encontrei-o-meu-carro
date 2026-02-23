import type { Route } from "./+types/api.cars.search";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const brand = url.searchParams.get("brand") || undefined;
  const type = url.searchParams.get("type") || undefined;
  const minPrice = Number(url.searchParams.get("minPrice")) || undefined;
  const maxPrice = Number(url.searchParams.get("maxPrice")) || undefined;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const sort = url.searchParams.get("sort") || "brand";
  const order = url.searchParams.get("order") === "desc" ? "desc" : "asc";

  const where: Record<string, unknown> = {
    moderation_status: "approved",
  };
  if (brand) where.brand = brand;
  if (type) where.type = type;
  if (minPrice || maxPrice) {
    where.price_avg = {
      ...(minPrice ? { gte: minPrice } : {}),
      ...(maxPrice ? { lte: maxPrice } : {}),
    };
  }

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      include: { spec: true },
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.car.count({ where }),
  ]);

  return Response.json({
    cars: cars.map((car) => ({
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price_avg: car.price_avg.toString(),
      type: car.type,
      imageUrl: car.imageUrl,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
