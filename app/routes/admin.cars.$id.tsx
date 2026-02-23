import { redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/admin.cars.$id";
import { prisma } from "~/utils/db.server";
import { requireAdminAuth } from "~/utils/admin-auth.server";
import { CarFormSchema } from "~/schemas/car";
import { calculateScores } from "~/utils/score.server";
import { CarForm } from "~/components/admin/CarForm";
import { Button } from "~/components/ui/button";
import { Link, Form } from "react-router";
import { ArrowLeft, Trash2 } from "lucide-react";

export async function loader({ request, params }: Route.LoaderArgs) {
  requireAdminAuth(request);

  const car = await prisma.car.findUnique({
    where: { id: params.id },
    include: { spec: true },
  });

  if (!car) throw new Response("Carro não encontrado", { status: 404 });

  return {
    car: {
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price_avg: Number(car.price_avg),
      type: car.type,
      imageUrl: car.imageUrl || "",
      fipe_code: car.fipe_code || undefined,
      moderation_status: car.moderation_status as
        | "pending"
        | "approved"
        | "rejected",
      trunk_liters: car.spec?.trunk_liters ?? 0,
      tank_capacity: car.spec?.tank_capacity ?? 0,
      wheelbase: car.spec?.wheelbase ?? 0,
      ground_clearance: car.spec?.ground_clearance ?? 0,
      fuel_consumption_city: car.spec?.fuel_consumption_city ?? 0,
      fuel_consumption_highway: car.spec?.fuel_consumption_highway ?? undefined,
      hp: car.spec?.hp ?? 0,
      acceleration: car.spec?.acceleration ?? 0,
      transmission: car.spec?.transmission ?? "Automático",
      fuel_type: car.spec?.fuel_type ?? "Flex",
    },
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  requireAdminAuth(request);

  if (request.method === "DELETE") {
    await prisma.car.delete({ where: { id: params.id } });
    return redirect("/admin");
  }

  const formData = await request.formData();
  const raw = Object.fromEntries(formData);
  const parsed = CarFormSchema.parse(raw);

  const scores = calculateScores({
    trunk_liters: parsed.trunk_liters,
    wheelbase: parsed.wheelbase,
    ground_clearance: parsed.ground_clearance,
    fuel_consumption_city: parsed.fuel_consumption_city,
    hp: parsed.hp ?? undefined,
    acceleration: parsed.acceleration ?? undefined,
  });

  await prisma.car.update({
    where: { id: params.id },
    data: {
      brand: parsed.brand,
      model: parsed.model,
      year: parsed.year,
      price_avg: parsed.price_avg,
      type: parsed.type,
      imageUrl: parsed.imageUrl || null,
      spec: {
        upsert: {
          create: {
            trunk_liters: parsed.trunk_liters,
            tank_capacity: parsed.tank_capacity,
            wheelbase: parsed.wheelbase,
            ground_clearance: parsed.ground_clearance,
            fuel_consumption_city: parsed.fuel_consumption_city,
            fuel_consumption_highway: parsed.fuel_consumption_highway ?? null,
            fuel_type: parsed.fuel_type,
            transmission: parsed.transmission,
            hp: parsed.hp || null,
            acceleration: parsed.acceleration || null,
            ...scores,
          },
          update: {
            trunk_liters: parsed.trunk_liters,
            tank_capacity: parsed.tank_capacity,
            wheelbase: parsed.wheelbase,
            ground_clearance: parsed.ground_clearance,
            fuel_consumption_city: parsed.fuel_consumption_city,
            fuel_consumption_highway: parsed.fuel_consumption_highway ?? null,
            fuel_type: parsed.fuel_type,
            transmission: parsed.transmission,
            hp: parsed.hp || null,
            acceleration: parsed.acceleration || null,
            ...scores,
          },
        },
      },
    },
  });

  return redirect(`/admin/cars/${params.id}`);
}

export const meta = () => [{ title: "Editar Carro — Admin" }];

export default function AdminCarsEditPage() {
  const { car } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/admin"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar ao painel
        </Link>
        <Form method="delete">
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            className="min-h-[44px] gap-2"
          >
            <Trash2 className="size-4" />
            Excluir
          </Button>
        </Form>
      </div>

      <h1 className="mb-6 text-2xl font-bold">
        Editar: {car.brand} {car.model}
      </h1>
      <CarForm defaultValues={car} isEdit />
    </div>
  );
}
