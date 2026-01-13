import type { Route } from "./+types/admin";
import { Form, useActionData, useNavigation, Link, useSubmit, useSearchParams } from "react-router";
import { prisma } from "~/utils/db.server";
import { calculateScores } from "~/utils/score.server";
import { getBrandsParallelum, getModelsParallelum } from "~/services/fipe.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Checkbox } from "~/components/ui/checkbox";
import { ScrollArea } from "~/components/ui/scroll-area";
import * as React from "react";

// Basic Auth Logic
const ADMIN_USER = "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "123456";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Admin - Backoffice" },
        { name: "description", content: "Cadastrar novos carros" },
    ];
}

export async function loader({ request }: Route.LoaderArgs) {
    const authHeader = request.headers.get("Authorization");

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
    const editId = url.searchParams.get("edit");
    const importBrand = url.searchParams.get("importBrand");

    // Parallelum FIPE
    const brands = await getBrandsParallelum();
    let importModels: any[] = [];
    if (importBrand) {
        const data = await getModelsParallelum(importBrand);
        importModels = data.modelos || [];
    }

    const [cars, editCar] = await Promise.all([
        prisma.car.findMany({
            orderBy: { brand: 'asc' },
            include: { spec: true }
        }),
        editId ? prisma.car.findUnique({ where: { id: editId }, include: { spec: true } }) : Promise.resolve(null)
    ]);

    return { cars, editCar, brands, importModels, importBrand };
}

export async function action({ request }: Route.ActionArgs) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401 });

    const formData = await request.formData();
    const intent = formData.get("intent");

    try {
        if (intent === "import_fipe") {
            const brandName = formData.get("brandName") as string;
            const selectedModels = formData.getAll("selectedModels") as string[]; // These are JSON strings of {nome, codigo} or just names? 
            // Better pass simplified data: "Name|Code"

            if (!selectedModels || selectedModels.length === 0) {
                return { success: false, message: "Nenhum modelo selecionado." };
            }

            let count = 0;
            for (const item of selectedModels) {
                const [modelName, modelCode] = (item as string).split("|");

                // Check if exists
                const exists = await prisma.car.findFirst({
                    where: { brand: brandName, model: modelName }
                });

                if (!exists) {
                    await prisma.car.create({
                        data: {
                            brand: brandName,
                            model: modelName,
                            year: new Date().getFullYear(), // Default to current year, user must edit later or we fetch years? 
                            // Fetching years for every model in bulk is too slow. 
                            // Strategy: Insert generic "2024" draft, User refines.
                            price_avg: 0, // Placeholder
                            type: "Unknown",
                            spec: undefined, // No spec = Draft
                        }
                    });
                    count++;
                }
            }
            return { success: true, message: `${count} modelos importados como Rascunho!` };
        }

        // Manual Save / Edit
        const id = formData.get("id") as string | null;
        const brand = formData.get("brand") as string;
        const model = formData.get("model") as string;
        const year = parseInt(formData.get("year") as string);
        const price_avg = parseFloat(formData.get("price_avg") as string);
        const type = formData.get("type") as string;
        const imageUrl = formData.get("imageUrl") as string;

        const rawSpec = {
            trunk_liters: parseInt(formData.get("trunk_liters") as string),
            wheelbase: parseFloat(formData.get("wheelbase") as string),
            ground_clearance: parseInt(formData.get("ground_clearance") as string),
            fuel_consumption_city: parseFloat(formData.get("fuel_consumption_city") as string),
            hp: parseInt(formData.get("hp") as string),
            acceleration: parseFloat(formData.get("acceleration") as string),
        };

        const calculatedScores = calculateScores(rawSpec);

        if (id) {
            await prisma.car.update({
                where: { id },
                data: {
                    brand, model, year, price_avg, type, imageUrl,
                    spec: {
                        upsert: {
                            create: {
                                ...rawSpec,
                                ...calculatedScores,
                                fuel_type: "Flex",
                                transmission: "Automático"
                            },
                            update: {
                                ...rawSpec,
                                ...calculatedScores,
                            }
                        }
                    }
                }
            });
            return { success: true, message: `Carro ${model} atualizado com sucesso!` };
        } else {
            await prisma.car.create({
                data: {
                    brand, model, year, price_avg, type, imageUrl,
                    spec: {
                        create: {
                            ...rawSpec,
                            ...calculatedScores,
                            fuel_type: "Flex",
                            transmission: "Automático",
                        },
                    },
                },
            });
            return { success: true, message: `Carro ${model} cadastrado com sucesso!` };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: "Erro ao processar." };
    }
}

export default function Admin({ loaderData }: Route.ComponentProps) {
    const { cars = [], editCar, brands = [], importModels = [], importBrand } = (loaderData || {}) as any;
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const submit = useSubmit();
    const isSubmitting = navigation.state === "submitting";

    // Check if we are in import mode?
    // We can use a client-side tab state or URL param. URL param is better for "Fetch Models" step.
    const [activeTab, setActiveTab] = React.useState("manual");

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>

            <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="manual">Editor Manual</TabsTrigger>
                    <TabsTrigger value="import">Importar da FIPE</TabsTrigger>
                </TabsList>

                {actionData?.success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        {actionData.message}
                    </div>
                )}

                {/* MANUAL EDITOR */}
                <TabsContent value="manual" className="mt-0">
                    <div className="flex flex-col md:flex-row gap-10">
                        {/* Sidebar: Car List */}
                        <div className="w-full md:w-80 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold">Carros ({cars?.length || 0})</h2>
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/admin">Novo</Link>
                                </Button>
                            </div>
                            <div className="max-h-[800px] overflow-y-auto border rounded-xl divide-y">
                                {cars?.map((car: any) => (
                                    <Link
                                        key={car.id}
                                        to={`/admin?edit=${car.id}`}
                                        className={`flex items-center p-3 hover:bg-gray-50 transition-colors ${editCar?.id === car.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                                    >
                                        <div className="w-12 h-12 rounded bg-gray-100 mr-3 flex items-center justify-center text-xs text-gray-400 overflow-hidden">
                                            {car.imageUrl ? <img src={car.imageUrl} className="w-full h-full object-cover" /> : "N/A"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate">{car.brand} {car.model}</div>
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span>{car.year}</span>
                                                {!car.spec && <span className="text-amber-600 font-bold bg-amber-100 px-1 rounded">Rascunho</span>}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="flex-1 max-w-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold">
                                    {editCar ? `Editar ${editCar.brand} ${editCar.model}` : "Novo Carro"}
                                </h2>
                                {editCar && !editCar.spec && (
                                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-bold">
                                        Ficha Técnica Pendente
                                    </span>
                                )}
                            </div>

                            <Form method="post" className="space-y-6" key={editCar?.id || 'new'}>
                                <input type="hidden" name="intent" value="save" />
                                <input type="hidden" name="id" value={editCar?.id || ""} />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="brand">Marca</Label>
                                        <Input id="brand" name="brand" placeholder="Ex: Honda" defaultValue={editCar?.brand} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="model">Modelo</Label>
                                        <Input id="model" name="model" placeholder="Ex: HR-V" defaultValue={editCar?.model} required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Ano</Label>
                                        <Input id="year" name="year" type="number" defaultValue={editCar?.year || 2024} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price_avg">Preço Médio (R$)</Label>
                                        <Input id="price_avg" name="price_avg" type="number" placeholder="150000" defaultValue={editCar?.price_avg} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Categoria</Label>
                                        <Input id="type" name="type" defaultValue={editCar?.type || "SUV"} required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="imageUrl">URL da Imagem</Label>
                                    <Input id="imageUrl" name="imageUrl" placeholder="https://..." defaultValue={editCar?.imageUrl || ""} />
                                </div>

                                <Separator className="my-6" />
                                <h2 className="text-xl font-semibold mb-4">Especificações Técnicas</h2>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="trunk_liters">Porta-Malas (Litros)</Label>
                                        <Input id="trunk_liters" name="trunk_liters" type="number" placeholder="Ex: 437" defaultValue={editCar?.spec?.trunk_liters} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="wheelbase">Entre-Eixos (metros)</Label>
                                        <Input id="wheelbase" name="wheelbase" type="number" step="0.01" placeholder="Ex: 2.61" defaultValue={editCar?.spec?.wheelbase} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fuel_consumption_city">Consumo Urbano (km/l)</Label>
                                        <Input id="fuel_consumption_city" name="fuel_consumption_city" type="number" step="0.1" placeholder="Ex: 11.4" defaultValue={editCar?.spec?.fuel_consumption_city} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ground_clearance">Vão Livre (mm)</Label>
                                        <Input id="ground_clearance" name="ground_clearance" type="number" placeholder="Ex: 190" defaultValue={editCar?.spec?.ground_clearance} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hp">Potência (cv)</Label>
                                        <Input id="hp" name="hp" type="number" placeholder="Ex: 126" defaultValue={editCar?.spec?.hp || ""} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="acceleration">0-100 km/h (s)</Label>
                                        <Input id="acceleration" name="acceleration" type="number" step="0.1" placeholder="Ex: 11.2" defaultValue={editCar?.spec?.acceleration || ""} required />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
                                        {isSubmitting ? "Salvando..." : (editCar ? "Salvar Alterações" : "Cadastrar Carro")}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </TabsContent>

                {/* IMPORT EDITOR */}
                <TabsContent value="import" className="mt-0 max-w-2xl">
                    <div className="border rounded-xl p-6 bg-white shadow-sm space-y-6">
                        <div>
                            <h2 className="text-xl font-bold">1. Selecione a Marca</h2>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2 max-h-40 overflow-y-auto">
                                {brands.map((b: any) => (
                                    <Link
                                        key={b.codigo}
                                        to={`/admin?importBrand=${b.codigo}`}
                                        className={`text-sm p-2 border rounded text-center hover:border-blue-500 hover:text-blue-600 ${importBrand === b.codigo ? 'bg-blue-50 border-blue-500 font-bold' : ''}`}
                                        onClick={() => setActiveTab("import")} // Keep tab active
                                    >
                                        {b.nome}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {importBrand && (
                            <Form method="post">
                                <input type="hidden" name="intent" value="import_fipe" />
                                <input type="hidden" name="brandName" value={brands.find((b: any) => b.codigo === importBrand)?.nome} />

                                <div className="flex items-center justify-between mt-6 mb-2">
                                    <h2 className="text-xl font-bold">2. Selecione os Modelos</h2>
                                    <span className="text-sm text-gray-500">{importModels.length} encontrados</span>
                                </div>

                                <ScrollArea className="h-[400px] border rounded-md p-4">
                                    <div className="space-y-3">
                                        {importModels.map((m: any) => (
                                            <div key={m.codigo} className="flex items-center space-x-2">
                                                <Checkbox id={`model-${m.codigo}`} name="selectedModels" value={`${m.nome}|${m.codigo}`} />
                                                <label
                                                    htmlFor={`model-${m.codigo}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {m.nome}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                                    {isSubmitting ? "Importando..." : "Importar Selecionados como Rascunho"}
                                </Button>
                            </Form>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
