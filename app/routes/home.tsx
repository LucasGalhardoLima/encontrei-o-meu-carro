import type { Route } from "./+types/home";
import { Form } from "react-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Search } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Encontre o Meu Carro" },
    { name: "description", content: "Encontre o carro perfeito para você com base em dados reais." },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] bg-gray-50/50">
      <div className="w-full max-w-2xl px-4 space-y-8 text-center -mt-20">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900">
            Encontre o carro <br className="hidden md:block" />
            <span className="text-blue-600">perfeito para você.</span>
          </h1>
          <p className="text-lg text-gray-600 md:text-xl max-w-lg mx-auto">
            Deixe os dados brutos te guiarem. Sem vendedores, apenas a verdade sobre o seu próximo carro.
          </p>
        </div>

        <Form action="/results" method="get" className="relative flex items-center max-w-lg mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="q"
              placeholder="Ex: SUV até 150 mil..."
              className="h-14 pl-10 pr-32 rounded-full shadow-lg border-transparent focus:border-blue-500 text-lg bg-white transition-shadow hover:shadow-xl"
            />
            <Button
              type="submit"
              className="absolute right-1.5 top-1.5 h-11 rounded-full px-6 font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              Buscar
            </Button>
          </div>
        </Form>

        <div className="pt-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
            <span>Sugestões:</span>
            <Button variant="link" asChild className="p-0 h-auto text-gray-600 font-normal hover:text-blue-600 mx-1">
              <a href="/results?type=SUV">SUVs</a>
            </Button>
            <Button variant="link" asChild className="p-0 h-auto text-gray-600 font-normal hover:text-blue-600 mx-1">
              <a href="/results?order=cost_benefit">Melhor Custo-benefício</a>
            </Button>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest leading-none">Ou use nosso algoritmo</p>
            <Button variant="outline" size="lg" asChild className="rounded-full px-8 border-2 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold">
              <a href="/quiz" className="text-lg">Qual o seu match perfeito?</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
