import { useState } from "react";
import { useNavigate } from "react-router";
import { QuizStep, type StepConfig } from "~/components/quiz/QuizStep";
import { QuizProgress } from "~/components/quiz/QuizProgress";

const STEPS: StepConfig[] = [
  {
    key: "comfort",
    title: "Conforto",
    description: "Suspensão macia, espaço interno, silêncio na cabine",
    icon: "🛋️",
  },
  {
    key: "economy",
    title: "Economia",
    description: "Consumo baixo, autonomia para viagens longas",
    icon: "⛽",
  },
  {
    key: "performance",
    title: "Desempenho",
    description: "Potência, aceleração rápida, prazer ao dirigir",
    icon: "🏎️",
  },
  {
    key: "space",
    title: "Espaço",
    description: "Porta-malas grande, espaço para passageiros e bagagens",
    icon: "📦",
  },
];

export const meta = () => [
  { title: "Quiz — Encontre o Meu Carro" },
];

export default function QuizPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [weights, setWeights] = useState<Record<string, number>>({
    comfort: 50,
    economy: 50,
    performance: 50,
    space: 50,
  });

  const step = STEPS[currentStep];

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const params = new URLSearchParams({
        w_comfort: String(weights.comfort),
        w_economy: String(weights.economy),
        w_performance: String(weights.performance),
        w_space: String(weights.space),
        mode: "match",
      });
      navigate(`/results?${params.toString()}`);
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  return (
    <div className="container mx-auto flex max-w-md flex-col px-4 py-8">
      <QuizProgress current={currentStep} total={STEPS.length} />

      <div className="mt-8 flex flex-1 items-center justify-center">
        <QuizStep
          step={step}
          value={weights[step.key]}
          onChange={(v) => setWeights({ ...weights, [step.key]: v })}
          onPrev={handlePrev}
          onNext={handleNext}
          isFirst={currentStep === 0}
          isLast={currentStep === STEPS.length - 1}
        />
      </div>
    </div>
  );
}
