import { Slider } from "~/components/ui/slider";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type StepConfig = {
  key: string;
  title: string;
  description: string;
  icon: string;
};

export function QuizStep({
  step,
  value,
  onChange,
  onPrev,
  onNext,
  isFirst,
  isLast,
}: {
  step: StepConfig;
  value: number;
  onChange: (value: number) => void;
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const label =
    value <= 25
      ? "Pouco importante"
      : value <= 50
        ? "Moderado"
        : value <= 75
          ? "Importante"
          : "Muito importante";

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-6">
      <div className="text-center">
        <span className="text-4xl">{step.icon}</span>
        <h2 className="mt-3 text-xl font-bold">{step.title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {step.description}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={0}
          max={100}
          step={1}
          className="w-full"
          aria-label={`Importância de ${step.title}`}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="text-primary font-semibold">{value}</span>
        </div>
      </div>

      <div className="flex w-full max-w-sm gap-3">
        {!isFirst && (
          <Button
            variant="outline"
            onClick={onPrev}
            className="min-h-[44px] flex-1"
          >
            <ChevronLeft className="mr-1 size-4" />
            Voltar
          </Button>
        )}
        <Button
          onClick={onNext}
          className="min-h-[44px] flex-1"
        >
          {isLast ? "Ver resultados" : "Próximo"}
          {!isLast && <ChevronRight className="ml-1 size-4" />}
        </Button>
      </div>
    </div>
  );
}
