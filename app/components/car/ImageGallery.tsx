import { useState } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

type GalleryImage = {
  url: string;
  isPrimary?: boolean;
};

export function ImageGallery({
  images,
  alt,
}: {
  images: GalleryImage[];
  alt: string;
}) {
  const sorted = [...images].sort((a, b) =>
    a.isPrimary ? -1 : b.isPrimary ? 1 : 0
  );
  const [selected, setSelected] = useState(0);

  if (sorted.length === 0) {
    return (
      <div className="bg-muted flex aspect-[16/10] items-center justify-center rounded-lg">
        <p className="text-muted-foreground text-sm">Foto indisponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main image */}
      <div className="bg-muted aspect-[16/10] overflow-hidden rounded-lg">
        <img
          src={sorted[selected].url}
          alt={alt}
          className="size-full object-cover"
          loading="eager"
        />
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={cn(
                "bg-muted size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                selected === i
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <img
                src={img.url}
                alt={`${alt} - foto ${i + 1}`}
                className="size-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
