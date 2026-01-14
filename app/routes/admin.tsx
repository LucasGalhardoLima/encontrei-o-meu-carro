import type { Route } from "./+types/admin";
import { Link, useSubmit, useNavigation } from "react-router";
import { prisma } from "~/utils/db.server";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { PlusCircle, Edit2, Archive, Search } from "lucide-react";
import { Input } from "~/components/ui/input";

// Basic Auth Logic
const ADMIN_USER = "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "123456";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Admin - Backoffice" },
        { name: "description", content: "Gestão de Carros" },
    ];
}

export async function loader({ request }: Route.LoaderArgs) {
    const authHeader = request.headers.get("Authorization");

    // Simple Basic Auth Check
    if (!authHeader) {
        return new Response("Unauthorized", {
            status: 401,
            headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' },
        });
    }

    const [scheme, encoded] = authHeader.split(" ");
    if (!encoded || scheme !== "Basic") {
        return new Response("Unauthorized", {
            status: 401,
            headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' },
        });
    }

    const buffer = Buffer.from(encoded, "base64");
    const [user, pass] = buffer.toString("utf-8").split(":");

    if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
        return new Response("Forbidden", { status: 403 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get("q");

    const cars = await prisma.car.findMany({
        where: search ? {
            OR: [
                { brand: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } },
            ]
        } : undefined,
        orderBy: { brand: 'asc' },
        include: { spec: true }
    });

    return { cars, search };
}

export default function Admin({ loaderData }: Route.ComponentProps) {
    const { cars, search } = loaderData;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                    <div className="flex gap-2">
                        <Button asChild size="sm">
                            <Link to="/admin/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> Novo Carro
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search */}
                <div className="mb-6 relative max-w-md">
                    <form method="get">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            name="q"
                            className="pl-10 bg-white"
                            placeholder="Buscar por marca ou modelo..."
                            defaultValue={search || ""}
                        />
                    </form>
                </div>

                {/* List */}
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 border-b bg-gray-50 font-medium text-sm text-gray-500">
                        <div>Status</div>
                        <div>Carro</div>
                        <div className="text-right">Ações</div>
                    </div>
                    {cars.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            Nenhum carro encontrado.
                        </div>
                    )}
                    {cars.map((car) => (
                        <div key={car.id} className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 border-b last:border-0 items-center hover:bg-gray-50/50 transition-colors">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: car.spec ? '#22c55e' : '#f59e0b' }} title={car.spec ? "Publicado" : "Rascunho"}></div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden border">
                                    {car.imageUrl ? (
                                        <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{car.brand} {car.model}</div>
                                    <div className="text-xs text-gray-500 flex gap-2">
                                        <span>{car.year}</span>
                                        <span>•</span>
                                        <span>{car.type}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <Button size="sm" variant="outline" asChild>
                                    <Link to={`/admin/${car.id}`}>
                                        <Edit2 className="h-4 w-4 text-gray-500" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
