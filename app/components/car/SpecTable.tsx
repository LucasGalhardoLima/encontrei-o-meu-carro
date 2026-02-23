import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "~/components/ui/table";
import {
  formatLiters,
  formatKmPerLiter,
  formatCv,
  formatSeconds,
  formatMeters,
} from "~/utils/metrics";

type SpecData = {
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
};

const SPEC_ROWS: {
  label: string;
  getValue: (spec: SpecData) => string;
}[] = [
  { label: "Tipo de combustível", getValue: (s) => s.fuel_type },
  { label: "Transmissão", getValue: (s) => s.transmission },
  { label: "Consumo cidade", getValue: (s) => formatKmPerLiter(s.fuel_consumption_city) },
  {
    label: "Consumo estrada",
    getValue: (s) => (s.fuel_consumption_highway ? formatKmPerLiter(s.fuel_consumption_highway) : "-"),
  },
  { label: "Tanque", getValue: (s) => formatLiters(s.tank_capacity) },
  { label: "Porta-malas", getValue: (s) => formatLiters(s.trunk_liters) },
  { label: "Entre-eixos", getValue: (s) => formatMeters(s.wheelbase) },
  {
    label: "Altura do solo",
    getValue: (s) => `${s.ground_clearance} mm`,
  },
  { label: "Potência", getValue: (s) => formatCv(s.hp) },
  { label: "Aceleração 0-100", getValue: (s) => formatSeconds(s.acceleration) },
];

export function SpecTable({ spec }: { spec: SpecData }) {
  return (
    <Table>
      <TableBody>
        {SPEC_ROWS.map((row) => (
          <TableRow key={row.label}>
            <TableCell className="text-muted-foreground font-medium">
              {row.label}
            </TableCell>
            <TableCell className="text-right">{row.getValue(spec)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
