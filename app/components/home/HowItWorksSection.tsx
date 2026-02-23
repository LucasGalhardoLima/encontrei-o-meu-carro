import { Link } from "react-router";
import {
  SlidersHorizontal,
  BarChart3,
  GitCompareArrows,
  Heart,
} from "lucide-react";
import { useIntersectionFade } from "~/components/home/useIntersectionFade";

const steps = [
  {
    number: 1,
    icon: SlidersHorizontal,
    title: "Responda 4 perguntas",
    description:
      "Diga o que importa: conforto, economia, desempenho ou espaço.",
  },
  {
    number: 2,
    icon: BarChart3,
    title: "Veja seus matches",
    description:
      "Receba carros ranqueados por compatibilidade com seu perfil.",
  },
  {
    number: 3,
    icon: GitCompareArrows,
    title: "Compare lado a lado",
    description:
      "Analise até 4 carros com gráficos radar e métricas reais.",
  },
  {
    number: 4,
    icon: Heart,
    title: "Salve seus favoritos",
    description: "Monte sua garagem sem precisar criar conta.",
  },
] as const;

export function HowItWorksSection() {
  const ref = useIntersectionFade<HTMLElement>();

  return (
    <section ref={ref} className="landing-fade-base px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-5xl">
        <h2 className="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
          Como funciona
        </h2>
        <p className="mx-auto mb-14 max-w-lg text-center text-white/70">
          Quatro passos simples para encontrar o carro que combina com você.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="landing-card flex flex-col items-center gap-4 p-6 text-center"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white">
                {step.number}
              </div>
              <step.icon className="size-8 text-[oklch(0.80_0.14_250)]" />
              <h3 className="text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/70">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/quiz"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white/15 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            Começar o quiz
          </Link>
        </div>
      </div>
    </section>
  );
}
