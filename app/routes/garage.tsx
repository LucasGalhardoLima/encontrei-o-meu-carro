import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { GarageList } from "~/components/garage/GarageList";

export const meta = () => [{ title: "Minha Garagem — Encontre o Meu Carro" }];

export default function GaragePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Link
        to="/results"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar aos resultados
      </Link>

      <div className="mt-4">
        <h1 className="mb-2 text-2xl font-bold">Minha Garagem</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Seus carros favoritos salvos localmente.
        </p>

        <GarageList />
      </div>
    </div>
  );
}
