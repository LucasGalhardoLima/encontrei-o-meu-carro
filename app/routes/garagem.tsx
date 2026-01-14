import * as React from "react";
import type { Route } from "./+types/garagem";
import { Link, useFetcher, useNavigate } from "react-router";
import { useFavoritesStore } from "~/stores/favorites";
import { FavoriteButton } from "~/components/FavoriteButton";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ArrowLeft, CarFront, Share2 } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Minha Garagem - Encontre o meu carro" },
        { name: "description", content: "Seus carros favoritos salvos." },
    ];
}

export default function Garagem() {
    const { favoriteIds } = useFavoritesStore();
    const fetcher = useFetcher<{ cars: any[] }>();
    const navigate = useNavigate();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (mounted && favoriteIds.length > 0) {
            // Load fresh data for favorites from API
            fetcher.load(`/api/cars?ids=${favoriteIds.join(",")}`);
        }
    }, [favoriteIds, mounted]);

    const cars = fetcher.data?.cars || [];
    const isLoading = fetcher.state === "loading";

    if (!mounted) return null; // Hydration fix

    return (
        <div className="container mx-auto py-8 px-4 flex flex-col gap-8 pb-24 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900">Minha Garagem</h1>
                    <p className="text-gray-500">Seus carros favoritos ficam salvos aqui neste navegador.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" asChild>
                        <Link to="/results"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar para busca</Link>
                    </Button>
                </div>
            </div>

            <Separator />

            {favoriteIds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="bg-gray-100 p-6 rounded-full">
                        <CarFront className="w-12 h-12 text-gray-300" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900">Sua garagem está vazia</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Você ainda não favoritou nenhum carro. Explore os resultados e clique no coração ❤️ para salvar.
                        </p>
                    </div>
                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                        <Link to="/results">Explorar Carros</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 font-bold"
                            disabled={cars.length < 2}
                            onClick={() => navigate(`/compare?ids=${cars.map((c: any) => c.id).join(",")}`)}
                        >
                            Comparar Estes {cars.length} Carros
                        </Button>
                    </div>

                    {/* Grid */}
                    {isLoading && cars.length === 0 ? (
                        <div className="py-20 text-center text-gray-400">Carregando sua garagem...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cars.map((car: any) => (
                                <Card key={car.id} className="relative group overflow-hidden border-none shadow-md hover:shadow-xl transition-all">
                                    <div className="absolute top-3 right-3 z-30">
                                        <FavoriteButton carId={car.id} className="bg-white/90 shadow-sm hover:bg-white" />
                                    </div>

                                    <Link to={`/carros/${car.id}`} className="block h-full">
                                        <div className="aspect-[16/9] relative bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {car.imageUrl ? (
                                                <img src={car.imageUrl} alt={car.model} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                            ) : (
                                                <span className="text-gray-400">Sem imagem</span>
                                            )}
                                        </div>
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
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
