import { useSearchParams } from "react-router";
import { useState } from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

const CAR_TYPES = ["SUV", "Hatch", "Sedan", "Picape"] as const;

const PRICE_RANGES: { label: string; min?: number; max?: number }[] = [
  { label: "Até R$ 80.000", max: 80000 },
  { label: "R$ 80.000 - R$ 130.000", min: 80000, max: 130000 },
  { label: "R$ 130.000 - R$ 180.000", min: 130000, max: 180000 },
  { label: "Acima de R$ 180.000", min: 180000 },
];

export function ResultsFilter({ brands }: { brands: string[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const activeBrand = searchParams.get("brand") || "";
  const activeType = searchParams.get("type") || "";
  const activePriceMin = searchParams.get("price_min") || "";
  const activePriceMax = searchParams.get("price_max") || "";

  const activeCount = [activeBrand, activeType, activePriceMin || activePriceMax].filter(Boolean).length;

  function updateParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  function setPriceRange(min?: number, max?: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (min) next.set("price_min", String(min));
      else next.delete("price_min");
      if (max) next.set("price_max", String(max));
      else next.delete("price_max");
      return next;
    });
  }

  function clearFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("brand");
      next.delete("type");
      next.delete("price_min");
      next.delete("price_max");
      return next;
    });
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Mobile toggle */}
      <div className="flex items-center justify-between md:hidden">
        <Button
          variant="outline"
          size="sm"
          className="min-h-[44px] gap-2"
          onClick={() => setExpanded(!expanded)}
        >
          <Filter className="size-4" />
          Filtros
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeCount}
            </Badge>
          )}
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 size-4" /> Limpar
          </Button>
        )}
      </div>

      {/* Filter content */}
      <div
        className={cn(
          "flex-wrap gap-3 md:flex",
          expanded ? "flex" : "hidden md:flex"
        )}
      >
        {/* Brand */}
        <select
          value={activeBrand}
          onChange={(e) => updateParam("brand", e.target.value)}
          className="border-input bg-background min-h-[44px] rounded-md border px-3 text-sm"
          aria-label="Filtrar por marca"
        >
          <option value="">Todas as marcas</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Type */}
        <select
          value={activeType}
          onChange={(e) => updateParam("type", e.target.value)}
          className="border-input bg-background min-h-[44px] rounded-md border px-3 text-sm"
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos os tipos</option>
          {CAR_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Price */}
        <select
          value={
            activePriceMin || activePriceMax
              ? `${activePriceMin}-${activePriceMax}`
              : ""
          }
          onChange={(e) => {
            if (!e.target.value) {
              setPriceRange();
              return;
            }
            const [min, max] = e.target.value.split("-").map(Number);
            setPriceRange(min || undefined, max || undefined);
          }}
          className="border-input bg-background min-h-[44px] rounded-md border px-3 text-sm"
          aria-label="Filtrar por faixa de preço"
        >
          <option value="">Qualquer preço</option>
          {PRICE_RANGES.map((r) => (
            <option
              key={r.label}
              value={`${r.min || ""}-${r.max || ""}`}
            >
              {r.label}
            </option>
          ))}
        </select>

        {/* Desktop clear */}
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="hidden min-h-[44px] md:flex"
          >
            <X className="mr-1 size-4" /> Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
