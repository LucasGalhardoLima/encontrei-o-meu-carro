import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CarFormSchema, type CarFormValues } from "~/schemas/car";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Form, useNavigation } from "react-router";

interface CarFormProps {
    defaultValues?: Partial<CarFormValues>;
    intent: "create" | "update";
}

export function CarForm({ defaultValues, intent }: CarFormProps) {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const form = useForm<CarFormValues>({
        resolver: zodResolver(CarFormSchema) as any,
        defaultValues: defaultValues || {
            brand: "",
            model: "",
            year: new Date().getFullYear(),
            price_avg: 0,
            type: "SUV",
            imageUrl: "",
            trunk_liters: 0,
            wheelbase: 0,
            ground_clearance: 0,
            fuel_consumption_city: 0,
            hp: 0,
            acceleration: 0,
        },
    });

    const { register, formState: { errors } } = form;

    return (
        <Form method="post" className="space-y-8 max-w-2xl bg-white p-6 rounded-xl border shadow-sm">
            <input type="hidden" name="intent" value={intent} />

            <div>
                <h3 className="text-lg font-bold mb-4">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Input id="brand" {...register("brand")} placeholder="Ex: Honda" />
                        {errors.brand && <p className="text-red-500 text-xs">{errors.brand.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="model">Modelo</Label>
                        <Input id="model" {...register("model")} placeholder="Ex: HR-V" />
                        {errors.model && <p className="text-red-500 text-xs">{errors.model.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="year">Ano</Label>
                        <Input id="year" type="number" {...register("year")} />
                        {errors.year && <p className="text-red-500 text-xs">{errors.year.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price_avg">Preço Médio (R$)</Label>
                        <Input id="price_avg" type="number" {...register("price_avg")} />
                        {errors.price_avg && <p className="text-red-500 text-xs">{errors.price_avg.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Categoria</Label>
                        <Input id="type" {...register("type")} placeholder="SUV, Sedan..." />
                        {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input id="imageUrl" {...register("imageUrl")} placeholder="https://..." />
                {errors.imageUrl && <p className="text-red-500 text-xs">{errors.imageUrl.message}</p>}
            </div>

            <Separator />

            <div>
                <h3 className="text-lg font-bold mb-4">Especificações Técnicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="trunk_liters">Porta-Malas (L)</Label>
                        <Input id="trunk_liters" type="number" {...register("trunk_liters")} />
                        {errors.trunk_liters && <p className="text-red-500 text-xs">{errors.trunk_liters.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wheelbase">Entre-Eixos (m)</Label>
                        <Input id="wheelbase" type="number" step="0.01" {...register("wheelbase")} />
                        {errors.wheelbase && <p className="text-red-500 text-xs">{errors.wheelbase.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fuel_consumption_city">Consumo Urbano (km/l)</Label>
                        <Input id="fuel_consumption_city" type="number" step="0.1" {...register("fuel_consumption_city")} />
                        {errors.fuel_consumption_city && <p className="text-red-500 text-xs">{errors.fuel_consumption_city.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hp">Potência (cv)</Label>
                        <Input id="hp" type="number" {...register("hp")} />
                        {errors.hp && <p className="text-red-500 text-xs">{errors.hp.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="acceleration">0-100 km/h (s)</Label>
                        <Input id="acceleration" type="number" step="0.1" {...register("acceleration")} />
                        {errors.acceleration && <p className="text-red-500 text-xs">{errors.acceleration.message}</p>}
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : (intent === 'create' ? "Cadastrar Carro" : "Atualizar Carro")}
                </Button>
            </div>
        </Form>
    );
}
