import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  formatLiters,
  formatKmPerLiter,
  formatCv,
  formatSeconds,
  formatMeters,
} from "~/utils/metrics";
import { toPriceNumber } from "~/utils/price";

type CarData = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price_avg: string;
  type: string;
  imageUrl?: string | null;
  spec: {
    trunk_liters: number;
    tank_capacity: number;
    wheelbase: number;
    ground_clearance: number;
    fuel_consumption_city: number;
    fuel_consumption_highway?: number | null;
    fuel_type: string;
    transmission: string;
    hp?: number | null;
    acceleration?: number | null;
  } | null;
};

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

type RowDef = {
  label: string;
  getValue: (car: CarData) => string;
};

const ROWS: RowDef[] = [
  { label: "Preço médio", getValue: (c) => formatBRL(toPriceNumber(c.price_avg)) },
  { label: "Tipo", getValue: (c) => c.type },
  { label: "Combustível", getValue: (c) => c.spec?.fuel_type ?? "-" },
  { label: "Transmissão", getValue: (c) => c.spec?.transmission ?? "-" },
  { label: "Consumo cidade", getValue: (c) => c.spec ? formatKmPerLiter(c.spec.fuel_consumption_city) : "-" },
  {
    label: "Consumo estrada",
    getValue: (c) =>
      c.spec?.fuel_consumption_highway
        ? formatKmPerLiter(c.spec.fuel_consumption_highway)
        : "-",
  },
  { label: "Tanque", getValue: (c) => c.spec ? formatLiters(c.spec.tank_capacity) : "-" },
  { label: "Porta-malas", getValue: (c) => c.spec ? formatLiters(c.spec.trunk_liters) : "-" },
  { label: "Entre-eixos", getValue: (c) => c.spec ? formatMeters(c.spec.wheelbase) : "-" },
  {
    label: "Altura do solo",
    getValue: (c) => (c.spec ? `${c.spec.ground_clearance} mm` : "-"),
  },
  { label: "Potência", getValue: (c) => c.spec ? formatCv(c.spec.hp) : "-" },
  { label: "Aceleração 0-100", getValue: (c) => c.spec ? formatSeconds(c.spec.acceleration) : "-" },
];

export function ComparisonTable({ cars }: { cars: CarData[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-muted/50 sticky left-0 min-w-[140px]">
              Especificação
            </TableHead>
            {cars.map((car) => (
              <TableHead key={car.id} className="min-w-[160px] text-center">
                <div className="space-y-1">
                  <img
                    src={car.imageUrl || "/images/placeholder.png"}
                    alt={`${car.brand} ${car.model}`}
                    className="bg-muted mx-auto aspect-[16/10] w-32 rounded object-cover"
                  />
                  <p className="text-sm font-semibold">
                    {car.brand} {car.model}
                  </p>
                  <p className="text-muted-foreground text-xs">{car.year}</p>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="bg-muted/50 text-muted-foreground sticky left-0 font-medium">
                {row.label}
              </TableCell>
              {cars.map((car) => (
                <TableCell key={car.id} className="text-center">
                  {row.getValue(car)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
