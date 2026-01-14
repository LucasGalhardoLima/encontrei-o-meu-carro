import type { Route } from "./+types/carros.$id";
import { Link, useLoaderData } from "react-router";
import { prisma } from "~/utils/db.server";
import { calculateScores } from "~/utils/score.server";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Progress } from "~/components/ui/progress";
import { ArrowLeft, Gauge, Fuel, Snowflake, Box, Timer, Activity, Info } from "lucide-react";

export async function loader({ params }: Route.LoaderArgs) {
    const { id } = params;

    if (!id) throw new Response("ID Missing", { status: 404 });

    const car = await prisma.car.findUnique({
        where: { id },
        include: { spec: true }
    });

    if (!car) {
        throw new Response("Car not found", { status: 404 });
    }

    const scores = calculateScores({
        ...car.spec!,
        hp: car.spec!.hp ?? undefined,
        acceleration: car.spec!.acceleration ?? undefined
    });

    // Badges logic
    const badges = [];
    if (scores.trunk_score >= 9) badges.push("Porta-malas Gigante");
    if (scores.consumption_score >= 8) badges.push("Econômico");
    if (scores.hp_score >= 8) badges.push("Potente");
    if (scores.wheelbase_score >= 8) badges.push("Espaçoso");
    if ((scores.wheelbase_score + scores.ground_clearance_score) / 2 >= 8) badges.push("Conforto");

    return { car, badges, scores };
}

export function meta({ data }: Route.MetaArgs) {
    if (!data) return [{ title: "Carro não encontrado" }];
    const { car } = data;

    const title = `${car.brand} ${car.model} ${car.year} - Ficha Técnica`;
    const description = `Detalhes completos do ${car.brand} ${car.model}: ${car.spec?.hp}cv, Porta-malas ${car.spec?.trunk_liters}L. Compare e decida.`;

    return [
        { title },
        { name: "description", content: description },
    ];
}

export default function CarDetail({ loaderData }: Route.ComponentProps) {
    const { car, badges, scores } = loaderData;
    const spec = car.spec!;

    // Max values for progress bars (approximate references for this category)
    const MAX_TRUNK = 600; // Fastback is ~600
    const MAX_HP = 200; // Compass/Renegade ~185
    const MAX_CONSUMPTION = 20; // Electric/Hybrid can be high
    const MIN_ACCELERATION = 7; // Fast cars are lower, so we invert logic visually

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Nav */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" asChild className="text-gray-500 hover:text-blue-600">
                        <Link to="/results"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
                    </Button>
                    <span className="text-sm text-gray-400 font-medium">/ {car.brand} / {car.model}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-5xl">

                {/* Hero Section */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-16 mb-12 items-center">
                    <div className="relative group perspective-1000">
                        <div className="absolute inset-0 bg-blue-600/10 rounded-3xl transform rotate-1 transition-transform group-hover:rotate-2"></div>
                        <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100">
                            <img
                                src={car.imageUrl || "/images/placeholder.png"}
                                alt={`${car.brand} ${car.model}`}
                                className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                    {car.type}
                                </Badge>
                                <span className="text-gray-400 font-medium text-sm">{car.year}</span>
                            </div>
                            <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-2">
                                {car.model}
                            </h1>
                            <p className="text-2xl text-gray-500 font-medium">{car.brand}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {badges.map((b) => (
                                <Badge key={b} className="bg-gray-900 text-white hover:bg-black px-3 py-1">
                                    {b}
                                </Badge>
                            ))}
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Preço Médio (FIPE)</p>
                            <p className="text-4xl font-bold text-gray-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(car.price_avg)}
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button size="lg" className="flex-1 rounded-full text-lg h-14 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20" asChild>
                                <Link to={`/compare?ids=${car.id}`}>
                                    Comparar este carro
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Specs Visuals */}
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-blue-600" />
                    Performance & Especificações
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {/* Engine & Consumo */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-8">
                        <SpecBar
                            label="Potência (cv)"
                            value={spec.hp || 0}
                            max={MAX_HP}
                            icon={<Gauge className="w-5 h-5 text-gray-500" />}
                            suffix=" cv"
                        />
                        <SpecBar
                            label="Aceleração 0-100 km/h"
                            value={spec.acceleration || 0}
                            max={15}
                            inverse
                            icon={<Timer className="w-5 h-5 text-gray-500" />}
                            suffix=" seg"
                        />
                        <SpecBar
                            label="Consumo Urbano"
                            value={spec.fuel_consumption_city || 0}
                            max={MAX_CONSUMPTION}
                            icon={<Fuel className="w-5 h-5 text-gray-500" />}
                            suffix=" km/l"
                        />
                    </div>

                    {/* Dimensões & Conforto */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-8">
                        <SpecBar
                            label="Porta-malas"
                            value={spec.trunk_liters || 0}
                            max={MAX_TRUNK}
                            icon={<Box className="w-5 h-5 text-gray-500" />}
                            suffix=" Litros"
                        />
                        <SpecBar
                            label="Entre-eixos (Espaço interno)"
                            value={(spec.wheelbase || 0) * 100}
                            max={300}
                            min={230}
                            icon={<Info className="w-5 h-5 text-gray-500" />}
                            suffix=" cm"
                        />
                        <div className="pt-4 flex items-center justify-between text-sm text-gray-500 border-t">
                            <span className="flex items-center gap-2"><Snowflake className="w-4 h-4" /> Ar-Condicionado</span>
                            <span className="font-medium text-gray-900">Sim ({spec.fuel_type})</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="flex items-center gap-2"><Gauge className="w-4 h-4" /> Câmbio</span>
                            <span className="font-medium text-gray-900">{spec.transmission}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function SpecBar({ label, value, max, min = 0, icon, suffix, inverse = false }: { label: string, value: number, max: number, min?: number, icon: React.ReactNode, suffix: string, inverse?: boolean }) {
    // Calculate percentage based on min-max range
    let percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

    // For acceleration (lower is better), we invert the visual bar logic visually but value remains
    // Actually for "inverse" metrics like seconds, a FULL bar usually implies "better" or "less time".
    // Let's make it simpler: 
    // If inverse (acceleration), 100% bar = really fast (low seconds). 
    // so if value is 8s (fast), percentage should be high. If value is 15s (slow), percentage low.
    // Inverse calculation: 
    if (inverse) {
        // Let's say Max (Slowest) is 15s, Min (Fastest) is 5s.
        // If value is 8s. (15 - 8) / (15 - 5) = 7/10 = 70%.
        const best = 6;
        const worst = 16;
        percentage = Math.min(100, Math.max(0, ((worst - value) / (worst - best)) * 100));
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    {icon} {label}
                </div>
                <div className="text-xl font-black text-gray-900">
                    {value} <span className="text-sm font-normal text-gray-500">{suffix}</span>
                </div>
            </div>
            <Progress value={percentage} className="h-3 bg-gray-100" indicatorClassName={inverse ? "bg-orange-500" : "bg-blue-600"} />
        </div>
    )
}
