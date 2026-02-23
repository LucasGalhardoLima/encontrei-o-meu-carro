import { useLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/results";
import type { Prisma } from "@prisma/client";
import { prisma } from "~/utils/db.server";
import { calculateMatch, type Weights } from "~/utils/match.server";
import { toPriceNumber } from "~/utils/price";
import { CarGrid } from "~/components/car/CarGrid";
import { ResultsFilter } from "~/components/results/ResultsFilter";
import { QuizPromptBanner } from "~/components/results/QuizPromptBanner";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 12;

export const meta = () => [{ title: "Resultados — Encontre o Meu Carro" }];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "browse";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const q = url.searchParams.get("q")?.trim() || undefined;

  // Filters
  const brandFilter = url.searchParams.get("brand") || undefined;
  const typeFilter = url.searchParams.get("type") || undefined;
  const priceMin = Number(url.searchParams.get("price_min")) || undefined;
  const priceMax = Number(url.searchParams.get("price_max")) || undefined;

  // Build where clause
  const where: Prisma.CarWhereInput = {
    moderation_status: "approved",
  };
  if (q) {
    where.OR = [
      { brand: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
    ];
  }
  if (brandFilter) where.brand = brandFilter;
  if (typeFilter) where.type = typeFilter;
  if (priceMin || priceMax) {
    where.price_avg = {
      ...(priceMin ? { gte: priceMin } : {}),
      ...(priceMax ? { lte: priceMax } : {}),
    };
  }

  const brandsRaw = await prisma.car.findMany({
    where: { moderation_status: "approved" },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  const brands = brandsRaw.map((b) => b.brand);

  if (mode === "match") {
    // Match mode: need all cars to score + sort, then paginate in JS
    const [allCars, matchCount] = await Promise.all([
      prisma.car.findMany({
        where,
        include: { spec: true },
      }),
      prisma.car.count({ where }),
    ]);

    const weights: Weights = {
      comfort: Number(url.searchParams.get("w_comfort")) || 50,
      economy: Number(url.searchParams.get("w_economy")) || 50,
      performance: Number(url.searchParams.get("w_performance")) || 50,
      space: Number(url.searchParams.get("w_space")) || 50,
    };

    const carsWithMatch = allCars
      .map((car) => {
        const matchResult = calculateMatch(car, weights);
        return {
          id: car.id,
          brand: car.brand,
          model: car.model,
          year: car.year,
          price_avg: car.price_avg.toString(),
          type: car.type,
          imageUrl: car.imageUrl,
          matchPercentage: matchResult.percentage,
          categoryScores: matchResult.categoryScores,
          badges: matchResult.badges,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    const paginated = carsWithMatch.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );
    const totalPages = Math.ceil(carsWithMatch.length / PAGE_SIZE);

    return {
      mode: "match" as const,
      cars: paginated,
      brands,
      page,
      totalPages,
      totalCount: carsWithMatch.length,
      q,
    };
  }

  // Browse mode: paginate at DB level
  const [browseCars, totalCount] = await Promise.all([
    prisma.car.findMany({
      where,
      select: {
        id: true,
        brand: true,
        model: true,
        year: true,
        price_avg: true,
        type: true,
        imageUrl: true,
      },
      orderBy: { brand: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.car.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    mode: "browse" as const,
    cars: browseCars.map((car) => ({
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price_avg: car.price_avg.toString(),
      type: car.type,
      imageUrl: car.imageUrl,
    })),
    brands,
    page,
    totalPages,
    totalCount,
    q,
  };
}

export default function ResultsPage() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMatch = data.mode === "match";

  function goToPage(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(page));
      return next;
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">
        {isMatch
          ? "Seus melhores matches"
          : data.q
            ? `Resultados para "${data.q}"`
            : "Todos os carros"}
      </h1>
      <p className="text-muted-foreground mb-6 text-sm">
        {data.totalCount} carro{data.totalCount !== 1 ? "s" : ""} encontrado
        {data.totalCount !== 1 ? "s" : ""}
      </p>

      {!isMatch && <QuizPromptBanner />}

      <ResultsFilter brands={data.brands} />

      <CarGrid cars={data.cars} showMatch={isMatch} />

      {/* Pagination */}
      {data.totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-2"
          aria-label="Paginação"
        >
          <Button
            variant="outline"
            size="icon"
            className="size-11"
            disabled={data.page <= 1}
            onClick={() => goToPage(data.page - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-muted-foreground px-2 text-sm">
            Página {data.page} de {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-11"
            disabled={data.page >= data.totalPages}
            onClick={() => goToPage(data.page + 1)}
            aria-label="Próxima página"
          >
            <ChevronRight className="size-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
