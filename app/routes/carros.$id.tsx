import type { Route } from "./+types/carros.$id";
import { Link, useLoaderData, useNavigate } from "react-router";
import { prisma } from "~/utils/db.server";
import { calculateScores } from "~/utils/score.server";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Progress } from "~/components/ui/progress";
import { ArrowLeft, Gauge, Fuel, Snowflake, Box, Timer, Activity, Info, PlusCircle, CheckCircle, ExternalLink, ShoppingCart } from "lucide-react";
import { useComparisonStore } from "~/stores/comparison";
import { getWebmotorsUrl, getOlxUrl, getMercadoLivreUrl } from "~/utils/deep-links";
import * as React from "react";
import { FavoriteButton } from "~/components/FavoriteButton";

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
    if (!data || !data.car) {
        return [{ title: "Carro não encontrado" }];
    }

    const { car } = data;
    const siteUrl = "https://encontreomeucarro.com.br"; // Replace with actual domain env var if available

    // Construct dynamic OG image URL
    // /resource/og?brand=Fiat&model=Pulse&year=2024&price=120000&badge=Porta-malas
    const ogUrl = new URL(`${siteUrl}/resource/og`);
    ogUrl.searchParams.set("brand", car.brand);
    ogUrl.searchParams.set("model", car.model);
    ogUrl.searchParams.set("year", String(car.year));
    ogUrl.searchParams.set("price", String(car.price_avg));

    // Find a highlight/badge for the OG image
    let badge = "";
    if (car.spec) {
        if (car.spec.trunk_liters > 500) badge = `Porta-malas: ${car.spec.trunk_liters}L`;
        else if (car.spec.fuel_consumption_city > 14) badge = `Econômico: ${car.spec.fuel_consumption_city} km/l`;
        else if ((car.spec.hp || 0) > 150) badge = `Potente: ${car.spec.hp}cv`;
    }
    if (badge) ogUrl.searchParams.set("badge", badge);

    const description = `Confira os detalhes do ${car.brand} ${car.model} ${car.year}. Preço médio: R$ ${car.price_avg.toLocaleString('pt-BR')}.`;

    return [
        { title: `${car.brand} ${car.model} ${car.year} - Detalhes e Ficha Técnica` },
        { name: "description", content: description },

        // Open Graph
        { property: "og:title", content: `${car.brand} ${car.model} ${car.year}` },
        { property: "og:description", content: description },
        { property: "og:image", content: ogUrl.toString() },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:type", content: "website" },

        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${car.brand} ${car.model}` },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogUrl.toString() },
    ];
}

export default function CarDetail({ loaderData }: Route.ComponentProps) {
    const { car, badges, scores } = loaderData;
    const spec = car.spec!;
    const navigate = useNavigate();
    const { addCar, selectedCarIds } = useComparisonStore();
    const isSelected = selectedCarIds.includes(car.id);

    // Max values for progress bars (approximate references for this category)
    const MAX_TRUNK = 600; // Fastback is ~600
    const MAX_HP = 200; // Compass/Renegade ~185
    const MAX_CONSUMPTION = 20; // Electric/Hybrid can be high
    const MIN_ACCELERATION = 7; // Fast cars are lower, so we invert logic visually

    const handleCompare = () => {
        addCar(car.id);
        navigate(`/compare?ids=${car.id}`);
    };

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
                            <Button
                                size="lg"
                                onClick={handleCompare}
                                className="flex-1 rounded-full text-lg h-14 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                            >
                                <PlusCircle className="mr-2 h-5 w-5" /> Comparar este carro
                            </Button>
                            <FavoriteButton
                                carId={car.id}
                                size="lg"
                                className="h-14 w-14 rounded-full border-2 border-gray-100 shadow-lg"
                                variant="outline"
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop Offers Section */}
                <div className="hidden md:flex gap-4 mb-16 p-6 bg-gray-50 rounded-2xl border border-gray-100 items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Gostou do {car.model}?</h3>
                        <p className="text-gray-500 text-sm">Busque agora ofertas reais no mercado.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline" className="border-gray-300 hover:bg-white hover:text-[#E60023] hover:border-[#E60023]">
                            <a href={getWebmotorsUrl(car.brand, car.model)} target="_blank" rel="noopener noreferrer">Webmotors</a>
                        </Button>
                        <Button asChild variant="outline" className="border-gray-300 hover:bg-white hover:text-[#6E0AD6] hover:border-[#6E0AD6]">
                            <a href={getOlxUrl(car.brand, car.model)} target="_blank" rel="noopener noreferrer">OLX</a>
                        </Button>
                        <Button asChild variant="outline" className="border-gray-300 hover:bg-white hover:text-[#FFE600] hover:border-[#FFE600] hover:text-black">
                            <a href={getMercadoLivreUrl(car.brand, car.model)} target="_blank" rel="noopener noreferrer">Mercado Livre</a>
                        </Button>
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

                <div className="container mx-auto px-4 py-8 max-w-5xl">
                    {/* (This section was intentionally left empty or for future use in previous snippets, but structured correctly here) */}
                </div>

                {/* Mobile Sticky Footer Placeholder - The actual footer is fixed */}
                <div className="md:hidden h-20"></div>
            </div>

            {/* Mobile Sticky Action Bar */}
            <MobileOffersFooter car={car} />
        </div>
    );
}

function MobileOffersFooter({ car }: { car: any }) {
    const [isOpen, setIsOpen] = React.useState(false);

    const links = [
        { name: "Webmotors", url: getWebmotorsUrl(car.brand, car.model), color: "bg-[#E60023] hover:bg-[#b3001b]" },
        { name: "OLX", url: getOlxUrl(car.brand, car.model), color: "bg-[#6E0AD6] hover:bg-[#5200a8]" },
        { name: "Mercado Livre", url: getMercadoLivreUrl(car.brand, car.model), color: "bg-[#FFE600] text-black hover:bg-[#e6cf00]" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] md:hidden z-50">
            {isOpen ? (
                <div className="space-y-3 mb-4 animate-in slide-in-from-bottom-10 fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-700">Onde você prefere buscar?</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 p-1">✕</button>
                    </div>
                    {links.map((link) => (
                        <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-between w-full p-4 rounded-xl font-bold text-white shadow-sm ${link.color}`}
                        >
                            {link.name}
                            <ExternalLink className="w-5 h-5 opacity-80" />
                        </a>
                    ))}
                </div>
            ) : (
                <div className="flex gap-3">
                    <Button
                        size="lg"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl text-lg shadow-lg shadow-green-600/20"
                        onClick={() => setIsOpen(true)}
                    >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Ver Ofertas Reais
                    </Button>
                </div>
            )}
        </div>
    );
}

function SpecBar({ label, value, max, min = 0, icon, suffix, inverse = false }: { label: string, value: number, max: number, min?: number, icon: React.ReactNode, suffix: string, inverse?: boolean }) {
    // Calculate percentage based on min-max range
    let percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

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
    );
}
