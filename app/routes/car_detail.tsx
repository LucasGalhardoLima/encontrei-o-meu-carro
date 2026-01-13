import type { Route } from "./+types/car_detail";
import { Link, useLoaderData } from "react-router";
import { prisma } from "~/utils/db.server";
import { calculateScores } from "~/utils/score.server";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ArrowLeft, Gauge, Fuel, Snowflake, Box } from "lucide-react";

export async function loader({ params }: Route.LoaderArgs) {
    const { brand, slug } = params;

    // Slug format expectation: Model-Year (e.g., Fastback-2024)
    // We need to parse this. A regex is robust enough for now.
    // Assuming Model does not contain a dash followed by 4 digits at the end.

    const match = slug?.match(/^(.*)-(\d{4})$/);

    if (!match || !brand) {
        throw new Response("Invalid URL format", { status: 404 });
    }

    const [, modelRaw, yearRaw] = match;
    const model = modelRaw.replace(/-/g, " "); // Replace dashes with spaces if model has spaces? The regex captures "Fastback" or "T-Cross".
    // T-Cross would be valid. 
    // If slug is "T-Cross-2024", match[1] = "T-Cross".
    // If slug is "Corolla-Cross-2024", match[1] = "Corolla-Cross". We might need to handle spaces vs dashes.
    // For now, let's try fuzzy search or just assume dashes in URL = spaces in DB for multi-word models, EXCEPT known dashed models.
    // Actually, seed data has "Corolla Cross" (space) and "T-Cross" (dash).
    // Let's try to find exactly first. If not found, replace dashes with spaces.

    const year = parseInt(yearRaw);

    let car = await prisma.car.findFirst({
        where: {
            brand: brand,
            model: model,
            year: year
        },
        include: { spec: true }
    });

    if (!car) {
        // Try replacing dashes with spaces (e.g. Corolla-Cross -> Corolla Cross)
        const modelWithSpaces = model.replace(/-/g, " ");
        car = await prisma.car.findFirst({
            where: {
                brand: brand,
                model: modelWithSpaces,
                year: year
            },
            include: { spec: true }
        });
    }

    if (!car) {
        throw new Response("Car not found", { status: 404 });
    }

    // Determine badges for SEO context
    // We can reuse the match logic but we need arbitrary weights to trigger them, 
    // OR we just calculate scores and manually check thresholds.
    const scores = calculateScores({
        ...car.spec!,
        hp: car.spec!.hp ?? undefined,
        acceleration: car.spec!.acceleration ?? undefined
    });
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
    const { car, badges } = data;

    const title = `${car.brand} ${car.model} ${car.year} - Encontre o Meu Carro`;
    const description = `Confira os detalhes do ${car.brand} ${car.model}. Porta-malas de ${car.spec?.trunk_liters}L, Consumo de ${car.spec?.fuel_consumption_city} km/l. Veja se é o match ideal para você.`;

    // Dynamic OG Image URL
    const params = new URLSearchParams();
    params.set("brand", car.brand);
    params.set("model", car.model);
    params.set("year", car.year.toString());
    params.set("price", car.price_avg.toString());
    if (badges.length > 0) params.set("badge", badges[0]);

    // Use absolute URL in production, relative might work for some crawlers but absolute is best.
    // For now relative to origin.
    const ogImage = `/resource/og?${params.toString()}`;

    return [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: ogImage },
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:image", content: ogImage },
    ];
}

export default function CarDetail({ loaderData }: Route.ComponentProps) {
    const { car, badges, scores } = (loaderData as unknown) as { car: any, badges: string[], scores: any };
    const spec = car.spec!;

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Button variant="ghost" asChild className="mb-6 -ml-4 text-gray-500 hover:text-blue-600">
                <Link to="/results"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Busca</Link>
            </Button>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-4">
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-gray-100">
                        <img src={car.imageUrl || ""} alt={`${car.brand} ${car.model}`} className="object-cover w-full h-full transform transition-transform hover:scale-105 duration-700" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-lg py-1 px-3 bg-blue-50 text-blue-700 border-blue-100">
                            {car.type}
                        </Badge>
                        {badges.map((b: string) => (
                            <Badge key={b} variant="outline" className="text-lg py-1 px-3 border-gray-400 text-gray-600">
                                {b}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tight text-gray-900 mb-2">
                            {car.brand} <span className="text-blue-600">{car.model}</span>
                        </h1>
                        <p className="text-2xl text-gray-500 font-medium">{car.year}</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-1">Preço Médio</p>
                        <p className="text-4xl font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(car.price_avg)}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <ScoreCard score={scores.trunk_score} label="Espaço" icon={<Box className="w-5 h-5" />} value={`${spec.trunk_liters} L`} />
                        <ScoreCard score={scores.consumption_score} label="Economia" icon={<Fuel className="w-5 h-5" />} value={`${spec.fuel_consumption_city} km/l`} />
                        <ScoreCard score={scores.hp_score} label="Potência" icon={<Gauge className="w-5 h-5" />} value={`${spec.hp} cv`} />
                        <ScoreCard score={(scores.wheelbase_score + scores.ground_clearance_score) / 2} label="Conforto" icon={<Snowflake className="w-5 h-5" />} value={`${spec.wheelbase} m`} />
                    </div>
                </div>
            </div>

            <Separator className="my-12" />

            <div className="grid md:grid-cols-3 gap-8 text-center bg-gray-900 text-white p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                <div className="relative z-10 space-y-2">
                    <p className="text-gray-400 text-sm uppercase tracking-widest">Porta-Malas</p>
                    <p className="text-4xl font-bold">{spec.trunk_liters} <span className="text-lg font-normal text-gray-500">Litros</span></p>
                </div>
                <div className="relative z-10 space-y-2">
                    <p className="text-gray-400 text-sm uppercase tracking-widest">0-100 km/h</p>
                    <p className="text-4xl font-bold">{spec.acceleration} <span className="text-lg font-normal text-gray-500">segundos</span></p>
                </div>
                <div className="relative z-10 space-y-2">
                    <p className="text-gray-400 text-sm uppercase tracking-widest">Consumo</p>
                    <p className="text-4xl font-bold">{spec.fuel_consumption_city} <span className="text-lg font-normal text-gray-500">km/l</span></p>
                </div>
            </div>

            <div className="mt-12 flex justify-center">
                <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
                    <Link to={`/compare?ids=${car.id}`}>Comparar com outro carro</Link>
                </Button>
            </div>
        </div>
    );
}

function ScoreCard({ score, label, icon, value }: { score: number, label: string, icon: React.ReactNode, value: string }) {
    // Color grade
    let color = "bg-red-100 text-red-700";
    if (score >= 5) color = "bg-yellow-100 text-yellow-700";
    if (score >= 8) color = "bg-green-100 text-green-700";

    return (
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border hover:shadow-md transition-shadow">
            <div className={`p-2 rounded-lg ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500 font-bold">{label}</p>
                <p className="font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    )
}
