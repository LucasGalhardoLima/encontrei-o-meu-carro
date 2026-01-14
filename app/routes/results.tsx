import type { Route } from "./+types/results";
import { prisma } from "~/utils/db.server";
import { type Prisma } from "@prisma/client";
import { Link, useSubmit, Form } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Filter, SlidersHorizontal, ArrowUpDown, CheckSquare, Square, Share2, ThumbsUp, ThumbsDown } from "lucide-react";
import * as React from "react";
import { calculateMatch } from "~/utils/match.server";
import RadarChart, { RadarLegend } from "~/components/RadarChart";
import { useComparisonStore } from "~/stores/comparison";
import { FavoriteButton } from "~/components/FavoriteButton";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Resultados - Encontre o meu carro" },
        { name: "description", content: "Resultados da sua busca" },
    ];
}

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const type = url.searchParams.get("type");
    const minTrunk = Number(url.searchParams.get("minTrunk")) || 0;
    const minCons = Number(url.searchParams.get("minCons")) || 0;
    const order = url.searchParams.get("order") || "price_asc";

    // Quiz Weights
    const w_comfort = Number(url.searchParams.get("w_comfort")) || 0;
    const w_economy = Number(url.searchParams.get("w_economy")) || 0;
    const w_performance = Number(url.searchParams.get("w_performance")) || 0;
    const w_space = Number(url.searchParams.get("w_space")) || 0;
    const isMatchMode = url.searchParams.get("mode") === "match";

    const filters: any = {};
    if (q) filters.OR = [{ model: { contains: q } }, { brand: { contains: q } }];
    if (type) filters.type = type;
    filters.spec = { trunk_liters: { gte: minTrunk }, fuel_consumption_city: { gte: minCons } };

    const rawCars = await prisma.car.findMany({ where: filters, include: { spec: true } });

    if (rawCars.length === 0) return { cars: [], params: { q, type, minTrunk, minCons, order, weights: null } };

    type CarWithSpec = Prisma.CarGetPayload<{ include: { spec: true } }>;

    const scoredCars = rawCars.map((car: CarWithSpec) => {
        const weights = { comfort: w_comfort, economy: w_economy, performance: w_performance, space: w_space };
        const matchResult = calculateMatch(car, weights);

        // Custom Custo-benefício (legacy logic but using scores now?) 
        // Let's keep a simple calculation for legacy sort if needed, or ignore.
        const legacyScore = car.price_avg;

        return {
            ...car,
            matchScore: matchResult.percentage,
            matchDetails: matchResult,
            legacyScore
        };
    });

    scoredCars.sort((a, b) => {
        if (isMatchMode) return b.matchScore - a.matchScore;
        if (order === 'cost_benefit') return b.matchScore - a.matchScore; // Fallback to match for now
        if (order === 'price_asc') return a.price_avg - b.price_avg;
        if (order === 'price_desc') return b.price_avg - a.price_avg;
        if (order === 'year_desc') return b.year - a.year;
        return 0;
    });

    return {
        cars: scoredCars,
        params: { q, type, minTrunk, minCons, order, isMatchMode },
        weights: isMatchMode ? { comfort: w_comfort, economy: w_economy, performance: w_performance, space: w_space } : null
    };
}

export default function Results({ loaderData }: Route.ComponentProps) {
    const { cars, params, weights } = loaderData;
    const submit = useSubmit();

    // Global state for comparison selection

    // Inside component:
    const { selectedCarIds, toggleCar, clearComparison } = useComparisonStore();
    const selectedCars = selectedCarIds;
    const toggleSelection = toggleCar;

    return (
        <div className="container mx-auto py-8 px-4 flex flex-col md:flex-row gap-8 pb-24">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-72 space-y-6 shrink-0">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <Filter className="h-5 w-5" /> Filtros
                </div>

                {/* ... existing sidebar content ... */}

                {params.isMatchMode && weights && (
                    <Card className="bg-blue-50/50 border-blue-100 shadow-none overflow-hidden">
                        {/* ... */}
                    </Card>
                )}

                <Form method="get" onChange={(e) => submit(e.currentTarget)} className="space-y-6">
                    {/* ... existing form content ... */}
                </Form>
            </aside>

            {/* Main Grid */}
            <main className="flex-1">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{cars.length} Carros encontrados</h1>
                        {params.isMatchMode && (
                            <p className="text-sm text-blue-600 font-medium">✨ Ordenados pelo seu Match Perfeito</p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Link da busca copiado! Compartilhe com amigos.");
                            }}
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Compartilhar Busca
                        </Button>
                        <div className="text-sm text-gray-500 hidden md:block">
                            Buscando por: {params.q || "Todos"}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cars.map((car: any) => {
                        const isSelected = selectedCars.includes(car.id);
                        return (
                            <Card key={car.id} className={`relative group overflow-hidden hover:shadow-xl transition-all border-none shadow-md ring-1 ring-gray-200 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}`}>

                                {/* Selection Checkbox - Moved outside Link to fix propagation */}
                                <div className="absolute top-3 left-3 z-30">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelection(car.id);
                                        }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${isSelected
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-white/90 text-gray-400 hover:bg-white hover:text-blue-500'
                                            }`}
                                    >
                                        {isSelected ? (
                                            <CheckSquare className="w-5 h-5" />
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Favorite Button - Top Right */}
                                <div className="absolute top-3 right-3 z-30">
                                    <FavoriteButton carId={car.id} className="shadow-md bg-white/90 hover:bg-white" />
                                </div>

                                <Link to={`/carros/${car.id}`} className="block h-full">
                                    <div className="aspect-[16/9] relative bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {car.imageUrl ? (
                                            <img src={car.imageUrl} alt={car.model} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <span className="text-gray-400">Sem imagem</span>
                                        )}

                                        {params.isMatchMode && (
                                            <div className="absolute top-12 left-3 z-20">
                                                <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-black shadow-lg flex items-center gap-1.5">
                                                    <span className="text-xs font-medium opacity-90">Match</span> {car.matchScore}%
                                                </div>
                                            </div>
                                        )}

                                        {/* Badges - Moved down slightly to avoid overlap with Favorite Button if needed, or relying on flex */}
                                        <div className="absolute top-12 right-3 flex flex-col gap-1 items-end z-20 pointer-events-none">
                                            {car.matchDetails?.badges?.map((badge: string, idx: number) => (
                                                <Badge key={idx} variant="secondary" className="bg-blue-100/90 text-blue-800 backdrop-blur-sm border-none shadow-sm">
                                                    {badge}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
// ... (rest of card)
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">{car.brand}</p>
                                                <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">{car.model}</h3>
                                            </div>
                                            <Badge variant="outline" className="border-gray-300 font-bold">{car.year}</Badge>
                                        </div>
                                    </CardHeader>
                                </Link>
                                <CardContent className="space-y-2 text-sm text-gray-600 pt-2">
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Porta-malas</p>
                                            <p className="font-bold text-gray-900">{car.spec?.trunk_liters} L</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Consumo (Urb)</p>
                                            <p className="font-bold text-gray-900">{car.spec?.fuel_consumption_city} km/L</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Desempenho</p>
                                            <p className="font-bold text-gray-900">{car.spec?.hp} cv / {car.spec?.acceleration}s</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Entre-eixos</p>
                                            <p className="font-bold text-gray-900">{car.spec?.wheelbase} m</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 pb-4 border-t bg-gray-50/50">
                                    <div className="w-full flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preço Médio</span>
                                        <span className="text-xl font-black text-blue-600">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(car.price_avg)}
                                        </span>
                                    </div>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>

                {/* Floating Action Bar */}
                {selectedCars.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                        <div className="bg-gray-900/90 backdrop-blur text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 border border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                    {selectedCars.length}
                                </div>
                                <span className="font-medium text-sm">Carros selecionados</span>
                            </div>
                            <div className="h-8 w-px bg-gray-700" />
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-white h-auto p-0"
                                    onClick={() => clearComparison()}
                                >
                                    Limpar
                                </Button>
                                <Button
                                    disabled={selectedCars.length < 2}
                                    asChild
                                    className="bg-white text-black hover:bg-gray-200 font-bold rounded-full px-6"
                                >
                                    <Link to={`/compare?ids=${selectedCars.join(',')}`}>
                                        Comparar Agora
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {cars.length === 0 && (
                    <div className="py-20 text-center text-gray-500">
                        <p className="text-lg">Ops! Nenhum carro atingiu sua busca.</p>
                        <p className="text-sm">Tente relaxar um pouco os filtros ou as prioridades.</p>
                        <Button variant="link" asChild className="mt-4 text-blue-600 font-bold">
                            <Link to="/results">Limpar tudo</Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

function PriorityBadge({ label, value }: { label: string; value: number }) {
    if (value === 0) return null;
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">{label}</span>
                <span className="font-bold text-blue-700">{value}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

function FeedbackControl({ carId, weights }: { carId: string; weights: any }) {
    const [status, setStatus] = React.useState<'idle' | 'loading' | 'success'>('idle');

    const handleFeedback = async (thumbs: boolean) => {
        setStatus('loading');
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carId, thumbs, weights })
            });
            setStatus('success');
        } catch (e) {
            console.error(e);
            setStatus('idle');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold shadow-sm animate-in fade-in zoom-in">
                Obrigado!
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className="bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm text-gray-400">
                ...
            </div>
        );
    }

    return (
        <div className="flex gap-1">
            <button
                onClick={() => handleFeedback(true)}
                className="bg-white/90 hover:bg-green-50 text-gray-400 hover:text-green-600 p-1.5 rounded-full shadow-sm transition-colors"
                title="Faz sentido"
            >
                <ThumbsUp className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleFeedback(false)}
                className="bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-600 p-1.5 rounded-full shadow-sm transition-colors"
                title="Não faz sentido"
            >
                <ThumbsDown className="w-4 h-4" />
            </button>
        </div>
    );
}
