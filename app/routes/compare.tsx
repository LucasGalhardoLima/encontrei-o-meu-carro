import type { Route } from "./+types/compare";
import { prisma } from "~/utils/db.server";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Check, X, Minus, ArrowLeft } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Comparação - Encontre o meu carro" },
        { name: "description", content: "Comparação lado a lado" },
    ];
}

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const ids = url.searchParams.get("ids")?.split(",") || [];

    if (ids.length === 0) return { cars: [] };

    const cars = await prisma.car.findMany({
        where: { id: { in: ids } },
        include: { spec: true }
    });

    return { cars };
}

export default function Compare({ loaderData }: Route.ComponentProps) {
    const { cars } = loaderData;

    if (cars.length === 0) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Nenhum carro selecionado</h1>
                <Button asChild><Link to="/results">Voltar para Resultados</Link></Button>
            </div>
        );
    }

    // Logic to calculate differences will go here

    const gridTemplateColumns = `200px repeat(${cars.length}, 1fr)`;

    return (
        <div className="container mx-auto py-8 px-4">
            <Button variant="ghost" asChild className="mb-6 -ml-4 text-gray-500 hover:text-black">
                <Link to="/results"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Resultados</Link>
            </Button>

            <h1 className="text-3xl font-black mb-10">Comparação Lado a Lado</h1>

            <div className="overflow-x-auto pb-10">
                <div
                    className="min-w-[1000px] grid gap-0 border rounded-xl overflow-hidden shadow-sm"
                    style={{ gridTemplateColumns }}
                >
                    {/* Header Row: Images and Names */}
                    <div className="bg-white border-b sticky left-0 z-20"></div> {/* Label Spacer */}
                    {cars.map(car => (
                        <div key={car.id} className="p-6 border-b text-center bg-white">
                            <div className="bg-gray-100 rounded-xl overflow-hidden aspect-[4/3] mb-4 shadow-sm mx-auto max-w-[280px]">
                                <img src={car.imageUrl ?? ""} className="w-full h-full object-cover" alt={car.model} />
                            </div>
                            <h2 className="text-xl font-black leading-tight">{car.model}</h2>
                            <p className="text-gray-500 text-sm mt-1">{car.brand}</p>
                        </div>
                    ))}

                    {/* General Section */}
                    <div className="col-span-full font-bold text-gray-400 uppercase text-[10px] tracking-widest py-3 px-6 bg-gray-50 border-b">Geral</div>

                    <div className="py-4 px-6 border-b font-semibold text-sm text-gray-600 bg-white sticky left-0 z-20">Preço Médio</div>
                    {cars.map(car => (
                        <div key={car.id} className="py-4 px-4 border-b text-center font-bold text-lg bg-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(car.price_avg)}
                        </div>
                    ))}

                    <div className="py-4 px-6 border-b font-semibold text-sm text-gray-600 bg-white sticky left-0 z-20">Ano</div>
                    {cars.map(car => (
                        <div key={car.id} className="py-4 px-4 border-b text-center font-medium bg-white">
                            {car.year}
                        </div>
                    ))}

                    {/* Dimensions Section */}
                    <div className="col-span-full font-bold text-gray-400 uppercase text-[10px] tracking-widest py-3 px-6 bg-gray-50 border-b">Dimensões</div>

                    <div className="py-4 px-6 border-b font-semibold text-sm text-gray-600 bg-white sticky left-0 z-20">Porta-malas</div>
                    {cars.map(car => (
                        <div key={car.id} className="py-4 px-4 border-b text-center font-bold bg-white text-blue-700">
                            {car.spec?.trunk_liters} L
                        </div>
                    ))}

                    <div className="py-4 px-6 border-b font-semibold text-sm text-gray-600 bg-white sticky left-0 z-20">Entre-eixos</div>
                    {cars.map(car => (
                        <div key={car.id} className="py-4 px-4 border-b text-center bg-white">
                            {car.spec?.wheelbase} m
                        </div>
                    ))}

                    <div className="py-4 px-6 border-b font-semibold text-sm text-gray-600 bg-white sticky left-0 z-20">Vão Livre</div>
                    {cars.map(car => (
                        <div key={car.id} className="py-4 px-4 border-b text-center bg-white">
                            {car.spec?.ground_clearance} mm
                        </div>
                    ))}

                    {/* Performance Section */}
                    <div className="col-span-full font-bold text-gray-400 uppercase text-[10px] tracking-widest py-3 px-6 bg-gray-50 border-b">Performance</div>

                    <div className="py-4 px-6 border-b font-semibold text-sm text-gray-600 bg-white sticky left-0 z-20">Potência</div>
                    {cars.map(car => (
                        <div key={car.id} className="py-4 px-4 border-b text-center font-bold bg-white">
                            {car.spec?.hp} cv
                        </div>
                    ))}

                    <div className="py-4 px-6 border-b font-semibold text-sm text-gray-600 bg-white sticky left-0 z-20">0-100 km/h</div>
                    {cars.map(car => (
                        <div key={car.id} className="py-4 px-4 border-b text-center bg-white">
                            {car.spec?.acceleration}s
                        </div>
                    ))}

                    <div className="py-4 px-6 border-b font-semibold text-sm text-gray-600 bg-white sticky left-0 z-20">Consumo (Urbano)</div>
                    {cars.map(car => (
                        <div key={car.id} className="py-4 px-4 border-b text-center font-bold text-green-700 bg-white">
                            {car.spec?.fuel_consumption_city} km/L
                        </div>
                    ))}

                    <div className="py-4 px-6 border-b font-semibold text-sm text-gray-600 bg-white sticky left-0 z-20">Câmbio</div>
                    {cars.map(car => (
                        <div key={car.id} className="py-4 px-4 border-b text-center text-xs bg-white">
                            {car.spec?.transmission}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
