import { z } from "zod";

export const InmetroEntrySchema = z.object({
  brand: z.string(),
  model: z.string(),
  fuel_consumption_city: z.number(),
  fuel_consumption_highway: z.number(),
  fuel_type: z.string(),
  efficiency_rating: z.string().optional(),
});

export type InmetroEntry = z.infer<typeof InmetroEntrySchema>;

/**
 * Download the Inmetro PBE Veicular PDF.
 * Returns raw buffer for parsing.
 */
export async function downloadPbePdf(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download Inmetro PDF: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Parse the PBE table from a PDF buffer.
 * Uses pdf-parse to extract text, then parses tabular data.
 */
export async function parsePbeTable(
  buffer: Buffer
): Promise<InmetroEntry[]> {
  let pdfParse: (buffer: Buffer) => Promise<{ text: string }>;
  try {
    pdfParse = (await import("pdf-parse")).default;
  } catch {
    console.warn("pdf-parse not available, returning empty entries");
    return [];
  }

  const pdf = await pdfParse(buffer);
  const lines = pdf.text.split("\n").map((l) => l.trim()).filter(Boolean);

  const entries: InmetroEntry[] = [];

  for (const line of lines) {
    const match = parseInmetroLine(line);
    if (match) {
      entries.push(match);
    }
  }

  return entries;
}

/**
 * Try to parse a single line into an InmetroEntry.
 * Inmetro PBE tables typically have: brand, model, fuel, city km/L, highway km/L, rating
 */
function parseInmetroLine(line: string): InmetroEntry | null {
  // Match patterns like: "FIAT ARGO 1.0 Gasolina/Etanol 13,5 14,8 A"
  const pattern =
    /^([A-Z][A-Z\s]+?)\s+(.+?)\s+(Gasolina|Etanol|Flex|Diesel|Gasolina\/Etanol|Elétrico)\s+(\d+[.,]\d+)\s+(\d+[.,]\d+)\s*([A-E])?/i;

  const match = line.match(pattern);
  if (!match) return null;

  return {
    brand: match[1].trim(),
    model: match[2].trim(),
    fuel_type: normalizeFuelType(match[3]),
    fuel_consumption_city: parseNumber(match[4]),
    fuel_consumption_highway: parseNumber(match[5]),
    efficiency_rating: match[6] || undefined,
  };
}

function parseNumber(str: string): number {
  return parseFloat(str.replace(",", ".")) || 0;
}

function normalizeFuelType(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("elétrico")) return "Elétrico";
  if (lower.includes("diesel")) return "Diesel";
  if (lower.includes("flex") || lower.includes("/")) return "Flex";
  if (lower.includes("etanol")) return "Flex";
  return "Flex";
}

/**
 * Match an Inmetro entry to a car by normalized brand + model substring.
 */
export function matchInmetroEntry(
  brand: string,
  model: string,
  entries: InmetroEntry[]
): InmetroEntry | null {
  const normBrand = brand.toLowerCase().trim();
  const normModel = model.toLowerCase().trim();

  return (
    entries.find((e) => {
      const eBrand = e.brand.toLowerCase().trim();
      const eModel = e.model.toLowerCase().trim();
      return (
        eBrand.includes(normBrand) &&
        (eModel.includes(normModel) || normModel.includes(eModel))
      );
    }) ?? null
  );
}
