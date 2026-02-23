import { useState } from "react";
import { useFetcher } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Check, X, Pencil, Search } from "lucide-react";

type PendingCar = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price_avg: string;
  type: string;
  source?: string | null;
  moderation_status: string;
};

export function ModerationQueue({ cars }: { cars: PendingCar[] }) {
  const [search, setSearch] = useState("");
  const fetcher = useFetcher();

  const filtered = cars.filter(
    (c) =>
      c.brand.toLowerCase().includes(search.toLowerCase()) ||
      c.model.toLowerCase().includes(search.toLowerCase())
  );

  const price = (val: string) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(Number(val));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por marca ou modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-[44px] pl-10"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marca/Modelo</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Fonte</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground text-center">
                Nenhum carro pendente
              </TableCell>
            </TableRow>
          )}
          {filtered.map((car) => (
            <TableRow key={car.id}>
              <TableCell className="font-medium">
                {car.brand} {car.model}
              </TableCell>
              <TableCell>{car.year}</TableCell>
              <TableCell>{price(car.price_avg)}</TableCell>
              <TableCell>
                <Badge variant="outline">{car.type}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{car.source || "manual"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <fetcher.Form method="post">
                    <input type="hidden" name="carId" value={car.id} />
                    <input type="hidden" name="intent" value="approve" />
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      className="size-9 text-green-600"
                      aria-label="Aprovar"
                    >
                      <Check className="size-4" />
                    </Button>
                  </fetcher.Form>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-9"
                    asChild
                  >
                    <a href={`/admin/cars/${car.id}`} aria-label="Editar">
                      <Pencil className="size-4" />
                    </a>
                  </Button>
                  <fetcher.Form method="post">
                    <input type="hidden" name="carId" value={car.id} />
                    <input type="hidden" name="intent" value="reject" />
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      className="size-9 text-red-600"
                      aria-label="Rejeitar"
                    >
                      <X className="size-4" />
                    </Button>
                  </fetcher.Form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
