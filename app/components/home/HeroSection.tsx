import { Link } from "react-router";
import { ChevronDown, Sparkles } from "lucide-react";
import { HeroSearch } from "~/components/home/HeroSearch";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-8 px-4 text-center">
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
        Pare de procurar.
        <br />
        Descubra o carro{" "}
        <span className="text-[oklch(0.80_0.14_250)]">certo para você</span>.
      </h1>

      <p className="max-w-xl text-lg text-white/80 md:text-xl">
        Diga o que importa — conforto, economia, potência ou espaço — e nosso
        algoritmo encontra os carros ideais para o seu perfil.
      </p>

      <Link
        to="/quiz"
        className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-8 py-3 text-lg font-semibold text-[oklch(0.30_0.15_250)] shadow-lg shadow-black/20 transition-colors hover:bg-white/90"
      >
        <Sparkles className="size-5" />
        Fazer o quiz
      </Link>

      <div className="w-full max-w-xl">
        <p className="mb-3 text-sm text-white/60">
          ou busque diretamente por marca ou modelo
        </p>
        <HeroSearch />
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <ChevronDown className="size-6 animate-bounce text-white/40" />
      </div>
    </section>
  );
}
