import { Progress } from "~/components/ui/progress";

export function QuizProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div className="space-y-1">
      <div className="text-muted-foreground text-center text-sm">
        {current + 1} de {total}
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
