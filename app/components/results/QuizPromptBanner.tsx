import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Sparkles } from "lucide-react";

export function QuizPromptBanner() {
  return (
    <div className="bg-primary/5 border-primary/20 mb-6 flex flex-col items-center gap-3 rounded-lg border p-4 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-2">
        <Sparkles className="text-primary size-5 shrink-0" />
        <p className="text-sm font-medium">
          Faça o quiz para ver resultados personalizados
        </p>
      </div>
      <Button asChild size="sm" className="min-h-[44px] w-full sm:w-auto">
        <Link to="/quiz">Fazer Quiz</Link>
      </Button>
    </div>
  );
}
