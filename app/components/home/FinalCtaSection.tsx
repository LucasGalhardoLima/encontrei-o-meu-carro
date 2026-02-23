import { Link } from "react-router";
import { Sparkles } from "lucide-react";
import { useIntersectionFade } from "~/components/home/useIntersectionFade";

export function FinalCtaSection() {
  const ref = useIntersectionFade<HTMLElement>();

  return (
    <section ref={ref} className="landing-fade-base px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-2xl text-center">
        <Sparkles className="mx-auto mb-6 size-10 text-white/50" />

        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
          Pronto para encontrar o carro ideal?
        </h2>

        <p className="mx-auto mb-10 max-w-md text-lg text-white/80">
          Responda 4 perguntas rápidas e descubra quais carros combinam com o
          seu estilo.
        </p>

        <Link
          to="/quiz"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-8 py-3 text-lg font-semibold text-[oklch(0.30_0.15_250)] shadow-lg shadow-black/20 transition-colors hover:bg-white/90"
        >
          Começar agora
        </Link>
      </div>
    </section>
  );
}
