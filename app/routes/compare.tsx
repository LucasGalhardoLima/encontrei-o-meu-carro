import type { Route } from "./+types/compare";
import { Link, useLoaderData, useNavigate } from "react-router";
import { prisma } from "~/utils/db.server";
import { Button } from "~/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { useComparisonStore } from "~/stores/comparison";
import { useEffect } from "react";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const idsParam = url.searchParams.get("ids");

    if (!idsParam) {
        return { cars: [] };
    }

    const ids = idsParam.split(",").filter(Boolean);

    if (ids.length === 0) {
        return { cars: [] };
    }

    const cars = await prisma.car.findMany({
        where: {
            id: { in: ids }
        },
        include: {
            spec: true
        }
    });

    // Sort to match ID order for consistency
    const sortedCars = ids.map(id => cars.find(c => c.id === id)).filter(Boolean) as typeof cars;

    return { cars: sortedCars };
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Comparador de Carros" },
        { name: "description", content: "Compare fichas técnicas lado a lado." },
    ];
}

export default function Compare({ loaderData }: Route.ComponentProps) {
    const { cars } = loaderData;
    const navigate = useNavigate();
    const { selectedCarIds, removeCar } = useComparisonStore();

    // Sync URL with Store if empty? Or Sync Store with URL?
    useEffect(() => {
        if (cars.length > 0 && selectedCarIds.length === 0) {
            cars.forEach(c => useComparisonStore.getState().addCar(c.id));
        }
    }, [cars, selectedCarIds]);


    if (cars.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
                    <h1 className="text-2xl font-bold text-gray-900">Nenhum carro selecionado</h1>
                    <p className="text-gray-500">Volte para a lista e selecione até 2 carros para comparar.</p>
                    <Button asChild>
                        <Link to="/results">Ver Carros</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Helper to determine winner
    // Returns index of winner (0 or 1) or -1 if draw
    const getWinner = (val1: number | undefined, val2: number | undefined, lowerIsBetter = false) => {
        if (typeof val1 !== 'number' || typeof val2 !== 'number') return -1;
        if (val1 === val2) return -1;
        if (lowerIsBetter) return val1 < val2 ? 0 : 1;
        return val1 > val2 ? 0 : 1;
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild className="text-gray-500 hover:text-blue-600">
                            <Link to="/results"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
                        </Button>
                        <h1 className="text-xl font-bold hidden sm:block">Comparativo</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-5xl">

                {/* Images & Header Row */}
                <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8 sticky top-[73px] z-10 bg-white pb-4 pt-2">
                    {cars.map((car, idx) => (
                        <div key={car.id} className="relative group">
                            <div className="aspect-[16/10] rounded-2xl overflow-hidden shadow-md bg-gray-100 mb-4 border border-gray-200">
                                <img
                                    src={car.imageUrl || "/images/placeholder.png"}
                                    className="object-cover w-full h-full"
                                    alt={car.model}
                                />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">{car.model}</h2>
                            <p className="text-sm text-gray-500 font-bold uppercase">{car.brand}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="border-gray-300">{car.year}</Badge>
                                <span className="text-lg font-bold text-blue-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(car.price_avg)}
                                </span>
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => {
                                    removeCar(car.id);
                                    // Update URL
                                    const newIds = cars.filter(c => c.id !== car.id).map(c => c.id);
                                    navigate(`/compare?ids=${newIds.join(',')}`);
                                }}
                                className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-gray-400 hover:text-red-500 shadow-sm border border-gray-200"
                            >
                                <XCircle className="w-6 h-6 fill-current" />
                            </button>
                        </div>
                    ))}
                    {cars.length === 1 && (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl aspect-[16/10] bg-gray-50 text-gray-400">
                            <p className="font-medium text-sm">Adicione outro carro</p>
                            <Button variant="link" asChild>
                                <Link to="/results">Ir para Lista</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {cars.length === 2 && (
                    <div className="space-y-8">
                        <ComparisonSection title="Motor & Performance">
                            <ComparisonRow
                                label="Potência (cv)"
                                val1={cars[0].spec?.hp ?? 0}
                                val2={cars[1].spec?.hp ?? 0}
                                unit="cv"
                                winnerIdx={getWinner(cars[0].spec?.hp ?? 0, cars[1].spec?.hp ?? 0)}
                            />
                            <ComparisonRow
                                label="0-100 km/h"
                                val1={cars[0].spec?.acceleration ?? 0}
                                val2={cars[1].spec?.acceleration ?? 0}
                                unit="s"
                                lowerIsBetter
                                winnerIdx={getWinner(cars[0].spec?.acceleration ?? 0, cars[1].spec?.acceleration ?? 0, true)}
                            />
                        </ComparisonSection>

                        <ComparisonSection title="Consumo (Inmetro)">
                            <ComparisonRow
                                label="Urbano"
                                val1={cars[0].spec?.fuel_consumption_city ?? 0}
                                val2={cars[1].spec?.fuel_consumption_city ?? 0}
                                unit="km/l"
                                winnerIdx={getWinner(cars[0].spec?.fuel_consumption_city ?? 0, cars[1].spec?.fuel_consumption_city ?? 0)}
                            />
                        </ComparisonSection>

                        <ComparisonSection title="Dimensões & Espaço">
                            <ComparisonRow
                                label="Porta-malas"
                                val1={cars[0].spec?.trunk_liters ?? 0}
                                val2={cars[1].spec?.trunk_liters ?? 0}
                                unit="Litros"
                                winnerIdx={getWinner(cars[0].spec?.trunk_liters ?? 0, cars[1].spec?.trunk_liters ?? 0)}
                            />
                            <ComparisonRow
                                label="Entre-eixos"
                                val1={cars[0].spec?.wheelbase ?? 0}
                                val2={cars[1].spec?.wheelbase ?? 0}
                                unit="m"
                                winnerIdx={getWinner(cars[0].spec?.wheelbase ?? 0, cars[1].spec?.wheelbase ?? 0)}
                            />
                            <ComparisonRow
                                label="Vão Livre do Solo"
                                val1={cars[0].spec?.ground_clearance ?? 0}
                                val2={cars[1].spec?.ground_clearance ?? 0}
                                unit="cm"
                                winnerIdx={getWinner(cars[0].spec?.ground_clearance ?? 0, cars[1].spec?.ground_clearance ?? 0)}
                            />
                        </ComparisonSection>
                    </div>
                )}
            </div>
        </div>
    );
}

function ComparisonSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-bold text-gray-700 uppercase text-xs tracking-wider">
                {title}
            </div>
            <div className="divide-y divide-gray-100">
                {children}
            </div>
        </div>
    )
}

function ComparisonRow({ label, val1, val2, unit, winnerIdx, lowerIsBetter }: { label: string, val1: number, val2: number, unit: string, winnerIdx: number, lowerIsBetter?: boolean }) {
    return (
        <div className="grid grid-cols-3 items-center text-sm md:text-base">
            <div className="p-4 text-gray-500 font-medium col-span-3 md:col-span-1 md:text-left text-center bg-gray-50/50 md:bg-transparent">
                {label}
            </div>

            {/* Val 1 */}
            <div className={`p-4 text-center font-bold relative transition-colors ${winnerIdx === 0 ? 'bg-green-50 text-green-800' : 'text-gray-900'}`}>
                {val1} <span className="text-xs font-normal text-gray-500">{unit}</span>
                {winnerIdx === 0 && (
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 hidden md:block">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                )}
            </div>

            {/* Val 2 */}
            <div className={`p-4 text-center font-bold relative transition-colors ${winnerIdx === 1 ? 'bg-green-50 text-green-800' : 'text-gray-900'}`}>
                {val2} <span className="text-xs font-normal text-gray-500">{unit}</span>
                {winnerIdx === 1 && (
                    <div className="absolute top-1/2 left-2 -translate-y-1/2 hidden md:block">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                )}
            </div>
        </div>
    )
}
