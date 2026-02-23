import { cn } from "~/lib/utils";

type CategoryScores = {
  comfort: number;
  economy: number;
  performance: number;
  space: number;
};

type CarWithScores = {
  id: string;
  brand: string;
  model: string;
  scores: CategoryScores;
};

const LABELS: { key: keyof CategoryScores; label: string }[] = [
  { key: "comfort", label: "Conforto" },
  { key: "economy", label: "Economia" },
  { key: "performance", label: "Desempenho" },
  { key: "space", label: "Espaço" },
];

const COLORS = [
  { fill: "fill-blue-500/20", stroke: "stroke-blue-500", dot: "fill-blue-500", text: "text-blue-500" },
  { fill: "fill-orange-500/20", stroke: "stroke-orange-500", dot: "fill-orange-500", text: "text-orange-500" },
  { fill: "fill-green-500/20", stroke: "stroke-green-500", dot: "fill-green-500", text: "text-green-500" },
  { fill: "fill-purple-500/20", stroke: "stroke-purple-500", dot: "fill-purple-500", text: "text-purple-500" },
];

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 80;
const LEVELS = 3;

function polarToXY(angle: number, radius: number) {
  const rad = (Math.PI / 180) * (angle - 90);
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

export function ComparisonRadar({
  cars,
  className,
}: {
  cars: CarWithScores[];
  className?: string;
}) {
  const angles = LABELS.map((_, i) => (360 / LABELS.length) * i);

  return (
    <div className={cn("space-y-4", className)}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mx-auto w-full max-w-[280px]"
        role="img"
        aria-label="Gráfico radar comparativo"
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

        {/* Data polygons per car */}
        {cars.map((car, carIdx) => {
          const color = COLORS[carIdx % COLORS.length];
          const points = LABELS.map((cat, i) => {
            const value = Math.min(10, Math.max(0, car.scores[cat.key]));
            const r = (value / 10) * RADIUS;
            return polarToXY(angles[i], r);
          });
          const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

          return (
            <g key={car.id}>
              <polygon
                points={polygon}
                className={cn(color.fill, color.stroke)}
                strokeWidth={2}
              />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3} className={color.dot} />
              ))}
            </g>
          );
        })}

        {/* Labels */}
        {LABELS.map((cat, i) => {
          const pos = polarToXY(angles[i], RADIUS + 22);
          return (
            <text
              key={cat.key}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-[11px] font-medium"
            >
              {cat.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {cars.map((car, idx) => {
          const color = COLORS[idx % COLORS.length];
          return (
            <div key={car.id} className="flex items-center gap-1.5">
              <span
                className={cn("inline-block size-3 rounded-full", color.dot)}
              />
              <span className="text-sm">
                {car.brand} {car.model}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
