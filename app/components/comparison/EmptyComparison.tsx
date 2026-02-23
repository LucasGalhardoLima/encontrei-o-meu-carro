import { Link } from "react-router";
import { GitCompareArrows } from "lucide-react";
import { Button } from "~/components/ui/button";

export function EmptyComparison() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <GitCompareArrows className="text-muted-foreground mb-4 size-16" />
      <h2 className="mb-2 text-xl font-semibold">
        Nenhum carro selecionado para comparação
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Selecione de 2 a 4 carros nos resultados ou nas páginas de detalhes para
        comparar lado a lado.
      </p>
      <Button asChild className="min-h-[44px]">
        <Link to="/results">Explorar carros</Link>
      </Button>
    </div>
  );
}
