import type { Route } from "./+types/admin.$id";
import { redirect, useLoaderData } from "react-router";
import { prisma } from "~/utils/db.server";
import { calculateScores } from "~/utils/score.server";
import { CarForm } from "~/components/CarForm";
import { CarFormSchema } from "~/schemas/car";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Link, Form } from "react-router";

export async function loader({ params }: Route.LoaderArgs) {
    const { id } = params;
    const car = await prisma.car.findUnique({
        where: { id },
        include: { spec: true }
    });

    if (!car) throw new Response("Not Found", { status: 404 });

    return { car };
}

export async function action({ request, params }: Route.ActionArgs) {
    const { id } = params;
    if (!id) return redirect("/admin");

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete") {
        await prisma.car.delete({ where: { id } });
        return redirect("/admin");
    }

    // Update case
    const data = Object.fromEntries(formData);
    const result = CarFormSchema.safeParse(data);

    if (!result.success) {
        return { error: result.error.message };
    }

    const validData = result.data;

    // Recalculate scores
    const scores = calculateScores({
        trunk_liters: validData.trunk_liters,
        wheelbase: validData.wheelbase,
        ground_clearance: validData.ground_clearance,
        fuel_consumption_city: validData.fuel_consumption_city,
        hp: validData.hp,
        acceleration: validData.acceleration,
    });

    await prisma.car.update({
        where: { id },
        data: {
            brand: validData.brand,
            model: validData.model,
            year: validData.year,
            price_avg: validData.price_avg,
            type: validData.type,
            imageUrl: validData.imageUrl || null,
            spec: {
                upsert: {
                    create: {
                        trunk_liters: validData.trunk_liters,
                        wheelbase: validData.wheelbase,
                        ground_clearance: validData.ground_clearance,
                        fuel_consumption_city: validData.fuel_consumption_city,
                        fuel_type: validData.fuel_type,
                        transmission: validData.transmission,
                        hp: validData.hp,
                        acceleration: validData.acceleration,
                        ...scores
                    },
                    update: {
                        trunk_liters: validData.trunk_liters,
                        wheelbase: validData.wheelbase,
                        ground_clearance: validData.ground_clearance,
                        fuel_consumption_city: validData.fuel_consumption_city,
                        fuel_type: validData.fuel_type,
                        transmission: validData.transmission,
                        hp: validData.hp,
                        acceleration: validData.acceleration,
                        ...scores
                    }
                }
            }
        }
    });

    return redirect("/admin");
}

export default function EditCar({ loaderData }: Route.ComponentProps) {
    const { car } = loaderData;

    // Map DB data to Form values
    const defaultValues = {
        brand: car.brand,
        model: car.model,
        year: car.year,
        price_avg: car.price_avg,
        type: car.type,
        imageUrl: car.imageUrl || "",
        trunk_liters: car.spec?.trunk_liters || 0,
        wheelbase: car.spec?.wheelbase || 0,
        ground_clearance: car.spec?.ground_clearance || 0,
        fuel_consumption_city: car.spec?.fuel_consumption_city || 0,
        hp: car.spec?.hp || 0,
        acceleration: car.spec?.acceleration || 0,
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild size="icon">
                            <Link to="/admin"><ArrowLeft className="h-5 w-5" /></Link>
                        </Button>
                        <h1 className="text-xl font-bold">Editar Carro</h1>
                    </div>

                    <Form method="post" onSubmit={(e) => {
                        if (!confirm("Tem certeza que deseja excluir?")) e.preventDefault();
                    }}>
                        <input type="hidden" name="intent" value="delete" />
                        <Button variant="destructive" size="sm" type="submit">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </Button>
                    </Form>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 flex justify-center">
                <CarForm intent="update" defaultValues={defaultValues} />
            </div>
        </div>
    );
}
