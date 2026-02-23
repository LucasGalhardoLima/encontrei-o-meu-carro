import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { useComparisonStore } from "~/stores/comparison";

export function ComparisonHeader({ count }: { count: number }) {
  const clearComparison = useComparisonStore((s) => s.clearComparison);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Comparar carros</h1>
        <p className="text-muted-foreground text-sm">
          {count} {count === 1 ? "carro selecionado" : "carros selecionados"}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="min-h-[44px] gap-2"
        onClick={clearComparison}
      >
        <Trash2 className="size-4" />
        Limpar
      </Button>
    </div>
  );
}
