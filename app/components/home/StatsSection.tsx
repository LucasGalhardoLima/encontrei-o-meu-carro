import { useIntersectionFade } from "~/components/home/useIntersectionFade";

const stats = [
  { value: "200+", label: "carros catalogados" },
  { value: "4", label: "dimensões de preferência" },
  { value: "2", label: "fontes oficiais (FIPE & Inmetro)" },
  { value: "0", label: "cadastros necessários" },
] as const;

export function StatsSection() {
  const ref = useIntersectionFade<HTMLElement>();

  return (
    <section ref={ref} className="landing-fade-base px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-4xl border-t border-white/20 pt-16 md:pt-24">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-bold text-white md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
