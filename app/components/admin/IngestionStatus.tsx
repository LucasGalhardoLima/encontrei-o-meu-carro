import { useFetcher } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Play } from "lucide-react";

type Job = {
  id: string;
  status: string;
  startedAt?: string | null;
  completedAt?: string | null;
  carsAdded: number;
  carsUpdated: number;
  carsSkipped: number;
};

export function IngestionStatus({ jobs }: { jobs: Job[] }) {
  const fetcher = useFetcher();
  const isRunning = fetcher.state === "submitting";

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Pipeline de Ingestão</CardTitle>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="trigger-ingestion" />
          <Button
            type="submit"
            size="sm"
            disabled={isRunning}
            className="min-h-[44px] gap-2"
          >
            <Play className="size-4" />
            {isRunning ? "Executando..." : "Executar agora"}
          </Button>
        </fetcher.Form>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhuma execução registrada
          </p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        job.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {job.status}
                    </Badge>
                    {job.startedAt && (
                      <span className="text-muted-foreground text-xs">
                        {new Date(job.startedAt).toLocaleString("pt-BR")}
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground flex gap-3 text-xs">
                    <span>+{job.carsAdded} novos</span>
                    <span>{job.carsSkipped} ignorados</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
