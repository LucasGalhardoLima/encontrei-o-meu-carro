import { HeroSection } from "~/components/home/HeroSection";
import { HowItWorksSection } from "~/components/home/HowItWorksSection";
import { DifferentiatorsSection } from "~/components/home/DifferentiatorsSection";
import { StatsSection } from "~/components/home/StatsSection";
import { FinalCtaSection } from "~/components/home/FinalCtaSection";

export const meta = () => [
  { title: "Encontre o Meu Carro — Descubra o carro ideal para você" },
  {
    name: "description",
    content:
      "Encontre o carro perfeito para suas necessidades com nosso quiz de preferências. Compare carros lado a lado e veja dados reais enriquecidos.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-[oklch(0.30_0.15_250)] to-[oklch(0.22_0.12_255)]">
      <HeroSection />
      <HowItWorksSection />
      <DifferentiatorsSection />
      <StatsSection />
      <FinalCtaSection />
    </div>
  );
}
