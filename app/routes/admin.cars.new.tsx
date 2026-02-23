import { redirect } from "react-router";
import type { Route } from "./+types/admin.cars.new";
import { prisma } from "~/utils/db.server";
import { requireAdminAuth } from "~/utils/admin-auth.server";
import { CarFormSchema } from "~/schemas/car";
import { calculateScores } from "~/utils/score.server";
import { CarForm } from "~/components/admin/CarForm";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  requireAdminAuth(request);
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  requireAdminAuth(request);
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

  const car = await prisma.car.create({
    data: {
      brand: parsed.brand,
      model: parsed.model,
      year: parsed.year,
      price_avg: parsed.price_avg,
      type: parsed.type,
      imageUrl: parsed.imageUrl || null,
      moderation_status: "approved",
      spec: {
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
      },
    },
  });

  return redirect(`/admin/cars/${car.id}`);
}

export const meta = () => [{ title: "Novo Carro — Admin" }];

export default function AdminCarsNewPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link
        to="/admin"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        Voltar ao painel
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Novo Carro</h1>
      <CarForm />
    </div>
  );
}
