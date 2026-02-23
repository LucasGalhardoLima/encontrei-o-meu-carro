import { ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  getWebmotorsUrl,
  getOlxUrl,
  getMercadoLivreUrl,
} from "~/utils/deep-links";

export function MarketplaceLinks({
  brand,
  model,
}: {
  brand: string;
  model: string;
}) {
  const links = [
    { label: "Webmotors", url: getWebmotorsUrl(brand, model) },
    { label: "OLX", url: getOlxUrl(brand, model) },
    { label: "Mercado Livre", url: getMercadoLivreUrl(brand, model) },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Button
          key={link.label}
          variant="outline"
          size="sm"
          className="min-h-[44px] gap-2"
          asChild
        >
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label}
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
      ))}
    </div>
  );
}
