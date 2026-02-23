import { cn } from "~/lib/utils";

type CategoryScores = {
  comfort: number;
  economy: number;
  performance: number;
  space: number;
};

const LABELS: { key: keyof CategoryScores; label: string }[] = [
  { key: "comfort", label: "Conforto" },
  { key: "economy", label: "Economia" },
  { key: "performance", label: "Desempenho" },
  { key: "space", label: "Espaço" },
];

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 70;
const LEVELS = 3;

function polarToXY(angle: number, radius: number) {
  const rad = (Math.PI / 180) * (angle - 90);
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

export function RadarChart({
  scores,
  className,
}: {
  scores: CategoryScores;
  className?: string;
}) {
  const angles = LABELS.map((_, i) => (360 / LABELS.length) * i);

  const points = LABELS.map((cat, i) => {
    const value = Math.min(10, Math.max(0, scores[cat.key]));
    const r = (value / 10) * RADIUS;
    return polarToXY(angles[i], r);
  });

  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={cn("w-full max-w-[200px]", className)}
      role="img"
      aria-label="Gráfico radar de pontuações"
    >
      {/* Grid levels */}
      {Array.from({ length: LEVELS }, (_, level) => {
        const r = ((level + 1) / LEVELS) * RADIUS;
        const gridPoints = angles
          .map((a) => polarToXY(a, r))
          .map((p) => `${p.x},${p.y}`)
          .join(" ");
        return (
          <polygon
            key={level}
            points={gridPoints}
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Axis lines */}
      {angles.map((angle, i) => {
        const end = polarToXY(angle, RADIUS);
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={end.x}
            y2={end.y}
            stroke="currentColor"
            className="text-border"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={polygon}
        className="fill-primary/20 stroke-primary"
        strokeWidth={2}
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          className="fill-primary"
        />
      ))}

      {/* Labels */}
      {LABELS.map((cat, i) => {
        const pos = polarToXY(angles[i], RADIUS + 18);
        return (
          <text
            key={cat.key}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-[10px] font-medium"
          >
            {cat.label}
          </text>
        );
      })}
    </svg>
  );
}
