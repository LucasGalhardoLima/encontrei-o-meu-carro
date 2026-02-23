import { cn } from "~/lib/utils";

export function MatchBadge({
  percentage,
  size = "md",
}: {
  percentage: number;
  size?: "sm" | "md" | "lg";
}) {
  const color =
    percentage >= 75
      ? "text-green-600 border-green-600"
      : percentage >= 50
        ? "text-yellow-500 border-yellow-500"
        : "text-red-500 border-red-500";

  const bgColor =
    percentage >= 75
      ? "bg-green-50 dark:bg-green-950"
      : percentage >= 50
        ? "bg-yellow-50 dark:bg-yellow-950"
        : "bg-red-50 dark:bg-red-950";

  const sizeClasses = {
    sm: "size-10 text-xs",
    md: "size-14 text-sm",
    lg: "size-18 text-base",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-full border-2 font-bold",
        color,
        bgColor,
        sizeClasses[size]
      )}
      aria-label={`${percentage}% de compatibilidade`}
    >
      <span>{percentage}%</span>
    </div>
  );
}
