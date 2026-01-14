import type { Route } from "./+types/admin.new";
import { redirect } from "react-router";
import { prisma } from "~/utils/db.server";
import { calculateScores } from "~/utils/score.server";
import { CarForm } from "~/components/CarForm";
import { CarFormSchema } from "~/schemas/car";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

// Reuse generic meta logic or customize
export function meta({ }: Route.MetaArgs) {
    return [{ title: "Novo Carro - Admin" }];
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Parse using Zod to ensure type safety and coercion
    const result = CarFormSchema.safeParse(data);

    if (!result.success) {
        // Return errors to field ? In remix traditional logic we return json.
        // But here we are using client side validation mostly. 
        // For safety, let's just log and throw for this MVP or return error.
        return { error: "Dados inválidos: " + result.error.issues.map((e: any) => e.message).join(", ") };
    }

    const validData = result.data;

    // Calculate scores on server
    const scores = calculateScores({
        trunk_liters: validData.trunk_liters,
        wheelbase: validData.wheelbase,
        ground_clearance: validData.ground_clearance,
        fuel_consumption_city: validData.fuel_consumption_city,
        hp: validData.hp,
        acceleration: validData.acceleration,
    });

    await prisma.car.create({
        data: {
            brand: validData.brand,
            model: validData.model,
            year: validData.year,
            price_avg: validData.price_avg,
            type: validData.type,
            imageUrl: validData.imageUrl || null,
            spec: {
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
                }
            }
        }
    });

    return redirect("/admin");
}

export default function NewCar() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" asChild size="icon">
                        <Link to="/admin"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <h1 className="text-xl font-bold">Novo Carro</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 flex justify-center">
                <CarForm intent="create" />
            </div>
        </div>
    );
}
