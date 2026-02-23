import type { Route } from "./+types/resource.og";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const carId = url.searchParams.get("carId");

  if (!carId) {
    return new Response(generateDefaultSvg(), {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
    });
  }

  const car = await prisma.car.findFirst({
    where: { id: carId, moderation_status: "approved" },
  });

  if (!car) {
    return new Response(generateDefaultSvg(), {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" },
    });
  }

  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(car.price_avg));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#0a0a0a"/>
    <text x="60" y="260" font-family="system-ui, sans-serif" font-size="48" font-weight="bold" fill="white">${escapeXml(car.brand)} ${escapeXml(car.model)}</text>
    <text x="60" y="320" font-family="system-ui, sans-serif" font-size="32" fill="#a1a1aa">${car.year} · ${escapeXml(car.type)}</text>
    <text x="60" y="390" font-family="system-ui, sans-serif" font-size="40" font-weight="bold" fill="#3b82f6">${escapeXml(price)}</text>
    <text x="60" y="560" font-family="system-ui, sans-serif" font-size="24" fill="#71717a">Encontre o Meu Carro</text>
  </svg>`;

  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}

function generateDefaultSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#0a0a0a"/>
    <text x="60" y="300" font-family="system-ui, sans-serif" font-size="48" font-weight="bold" fill="white">Encontre o Meu Carro</text>
    <text x="60" y="360" font-family="system-ui, sans-serif" font-size="28" fill="#a1a1aa">Descubra o carro ideal para você</text>
  </svg>`;
}

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
