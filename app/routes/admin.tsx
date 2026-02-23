import { useLoaderData } from "react-router";
import type { Route } from "./+types/admin";
import { prisma } from "~/utils/db.server";
import { requireAdminAuth } from "~/utils/admin-auth.server";
import { calculateScores } from "~/utils/score.server";
import { ModerationQueue } from "~/components/admin/ModerationQueue";
import { IngestionStatus } from "~/components/admin/IngestionStatus";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link } from "react-router";
import { Plus } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  requireAdminAuth(request);

  const [pendingCars, approvedCount, pendingCount, recentJobs] =
    await Promise.all([
      prisma.car.findMany({
        where: { moderation_status: "pending" },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.car.count({ where: { moderation_status: "approved" } }),
      prisma.car.count({ where: { moderation_status: "pending" } }),
      prisma.ingestionJob.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return {
    pendingCars: pendingCars.map((c) => ({
      id: c.id,
      brand: c.brand,
      model: c.model,
      year: c.year,
      price_avg: c.price_avg.toString(),
      type: c.type,
      source: c.source,
      moderation_status: c.moderation_status,
    })),
    approvedCount,
    pendingCount,
    recentJobs: recentJobs.map((j) => ({
      id: j.id,
      status: j.status,
      startedAt: j.startedAt?.toISOString() ?? null,
      completedAt: j.completedAt?.toISOString() ?? null,
      carsAdded: j.carsAdded,
      carsUpdated: j.carsUpdated,
      carsSkipped: j.carsSkipped,
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  requireAdminAuth(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const carId = formData.get("carId") as string;

  if (intent === "approve" && carId) {
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: { spec: true },
    });
    if (car) {
      // Recalculate scores on approve
      if (car.spec) {
        const scores = calculateScores({
          trunk_liters: car.spec.trunk_liters,
          wheelbase: car.spec.wheelbase,
          ground_clearance: car.spec.ground_clearance,
          fuel_consumption_city: car.spec.fuel_consumption_city,
          hp: car.spec.hp ?? undefined,
          acceleration: car.spec.acceleration ?? undefined,
        });
        await prisma.spec.update({
          where: { id: car.spec.id },
          data: scores,
        });
      }
      await prisma.car.update({
        where: { id: carId },
        data: { moderation_status: "approved" },
      });
    }
  }

  if (intent === "reject" && carId) {
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (car) {
      await prisma.car.update({
        where: { id: carId },
        data: { moderation_status: "rejected" },
      });
      if (car.fipe_code) {
        await prisma.rejectedCar.upsert({
          where: { fipe_code: car.fipe_code },
          create: {
            fipe_code: car.fipe_code,
            brand: car.brand,
            model: car.model,
            year: car.year,
            reason: "Rejected by admin",
          },
          update: { reason: "Rejected by admin" },
        });
      }
    }
  }

  if (intent === "trigger-ingestion") {
    // Start ingestion in background (non-blocking)
    import("~/services/ingestion/runner.server").then(({ runIngestionJob }) =>
      runIngestionJob().catch(console.error)
    );
  }

  return { ok: true };
}

export const meta = () => [{ title: "Admin — Encontre o Meu Carro" }];

export default function AdminPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel Admin</h1>
        <Button asChild className="min-h-[44px] gap-2">
          <Link to="/admin/cars/new">
            <Plus className="size-4" />
            Novo carro
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.approvedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">
              {data.pendingCount}
            </p>
          </CardContent>
        </Card>
        <IngestionStatus jobs={data.recentJobs} />
      </div>

      {/* Moderation Queue */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Fila de Moderação</h2>
        <ModerationQueue cars={data.pendingCars} />
      </div>
    </div>
  );
}
