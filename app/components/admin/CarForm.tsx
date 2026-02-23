import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useNavigation } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { CarFormSchema, type CarFormValues } from "~/schemas/car";

const TYPES = ["Hatch", "Sedan", "SUV", "Picape", "Minivan"] as const;
const TRANSMISSIONS = ["Manual", "Automático", "CVT"] as const;
const FUEL_TYPES = ["Flex", "Gasolina", "Diesel", "Elétrico"] as const;

export function CarForm({
  defaultValues,
  isEdit = false,
}: {
  defaultValues?: Partial<CarFormValues>;
  isEdit?: boolean;
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const {
    register,
    formState: { errors },
  } = useForm<CarFormValues>({
    resolver: zodResolver(CarFormSchema),
    defaultValues: {
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      price_avg: 0,
      type: "Hatch",
      imageUrl: "",
      trunk_liters: 0,
      tank_capacity: 0,
      wheelbase: 0,
      ground_clearance: 0,
      fuel_consumption_city: 0,
      hp: 0,
      acceleration: 0,
      transmission: "Automático",
      fuel_type: "Flex",
      ...defaultValues,
    },
  });

  return (
    <Form method="post" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Car info */}
        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input id="brand" {...register("brand")} className="min-h-[44px]" />
          {errors.brand && (
            <p className="text-destructive text-xs">{errors.brand.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input id="model" {...register("model")} className="min-h-[44px]" />
          {errors.model && (
            <p className="text-destructive text-xs">{errors.model.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Ano</Label>
          <Input
            id="year"
            type="number"
            {...register("year")}
            className="min-h-[44px]"
          />
          {errors.year && (
            <p className="text-destructive text-xs">{errors.year.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price_avg">Preço médio (R$)</Label>
          <Input
            id="price_avg"
            type="number"
            {...register("price_avg")}
            className="min-h-[44px]"
          />
          {errors.price_avg && (
            <p className="text-destructive text-xs">
              {errors.price_avg.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <select
            id="type"
            {...register("type")}
            className="border-input bg-background min-h-[44px] w-full rounded-md border px-3 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">URL da imagem</Label>
          <Input
            id="imageUrl"
            {...register("imageUrl")}
            className="min-h-[44px]"
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold">Especificações</h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="trunk_liters">Porta-malas (L)</Label>
          <Input
            id="trunk_liters"
            type="number"
            {...register("trunk_liters")}
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tank_capacity">Tanque (L)</Label>
          <Input
            id="tank_capacity"
            type="number"
            {...register("tank_capacity")}
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wheelbase">Entre-eixos (m)</Label>
          <Input
            id="wheelbase"
            type="number"
            step="0.01"
            {...register("wheelbase")}
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ground_clearance">Altura do solo (mm)</Label>
          <Input
            id="ground_clearance"
            type="number"
            {...register("ground_clearance")}
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuel_consumption_city">Consumo cidade (km/L)</Label>
          <Input
            id="fuel_consumption_city"
            type="number"
            step="0.1"
            {...register("fuel_consumption_city")}
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuel_consumption_highway">
            Consumo estrada (km/L)
          </Label>
          <Input
            id="fuel_consumption_highway"
            type="number"
            step="0.1"
            {...register("fuel_consumption_highway")}
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hp">Potência (cv)</Label>
          <Input
            id="hp"
            type="number"
            {...register("hp")}
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="acceleration">Aceleração 0-100 (s)</Label>
          <Input
            id="acceleration"
            type="number"
            step="0.1"
            {...register("acceleration")}
            className="min-h-[44px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transmission">Transmissão</Label>
          <select
            id="transmission"
            {...register("transmission")}
            className="border-input bg-background min-h-[44px] w-full rounded-md border px-3 text-sm"
          >
            {TRANSMISSIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuel_type">Combustível</Label>
          <select
            id="fuel_type"
            {...register("fuel_type")}
            className="border-input bg-background min-h-[44px] w-full rounded-md border px-3 text-sm"
          >
            {FUEL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="min-h-[44px]">
        {isSubmitting
          ? "Salvando..."
          : isEdit
            ? "Atualizar carro"
            : "Criar carro"}
      </Button>
    </Form>
  );
}
