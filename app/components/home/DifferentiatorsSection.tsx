import { Target, Database, GitCompareArrows, Zap } from "lucide-react";
import { useIntersectionFade } from "~/components/home/useIntersectionFade";

const differentiators = [
  {
    icon: Target,
    title: "Match por preferência",
    description:
      "Você não filtra por marca e ano. Você diz o que importa — conforto, economia, potência, espaço — e o algoritmo encontra os carros ideais, ranqueados por compatibilidade.",
  },
  {
    icon: Database,
    title: "Dados reais enriquecidos",
    description:
      "Preços FIPE atualizados, consumo testado pelo Inmetro, autonomia real. Calculamos quantas paradas você faz em 400km e quantas malas cabem no porta-malas.",
  },
  {
    icon: GitCompareArrows,
    title: "Compare até 4 carros",
    description:
      "Coloque os finalistas lado a lado com gráficos radar e métricas traduzidas para o dia a dia. Sem tabelas técnicas — informação que faz sentido.",
  },
  {
    icon: Zap,
    title: "Sem cadastro, sem fricção",
    description:
      "Use tudo agora: quiz, comparação, garagem de favoritos. Seus dados ficam no seu navegador, sem login, sem e-mail.",
  },
] as const;

export function DifferentiatorsSection() {
  const ref = useIntersectionFade<HTMLElement>();

  return (
    <section ref={ref} className="landing-fade-base px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-5xl">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          Por que o Encontre o Meu Carro?
        </h2>
        <p className="mx-auto mb-14 max-w-lg text-center text-white/70">
          Mais do que um buscador — uma experiência de descoberta.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {differentiators.map((item) => (
            <div
              key={item.title}
              className="landing-card-feature p-8"
            >
              <item.icon className="mb-4 size-8 text-[oklch(0.80_0.14_250)]" />
              <h3 className="mb-3 text-xl font-semibold text-white">
                {item.title}
              </h3>
              <p className="leading-relaxed text-white/70">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
