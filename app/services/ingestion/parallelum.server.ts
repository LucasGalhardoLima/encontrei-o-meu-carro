import { z } from "zod";

const BASE_URL = "https://parallelum.com.br/fipe/api/v2";

const BrandSchema = z.object({
  code: z.string(),
  name: z.string(),
});

const ModelSchema = z.object({
  code: z.number(),
  name: z.string(),
});

const YearSchema = z.object({
  code: z.string(),
  name: z.string(),
});

const CarDetailSchema = z.object({
  codeFipe: z.string(),
  brand: z.string(),
  model: z.string(),
  modelYear: z.number(),
  price: z.string(),
  priceNum: z.number().optional(),
  fuel: z.string(),
  referenceMonth: z.string(),
});

export type Brand = z.infer<typeof BrandSchema>;
export type Model = z.infer<typeof ModelSchema>;
export type Year = z.infer<typeof YearSchema>;
export type CarDetail = z.infer<typeof CarDetailSchema>;

const TOKEN = process.env.FIPE_API_TOKEN || "";

async function fetchWithRetry(
  url: string,
  retries = 3,
  delay = 1000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, {
      headers: TOKEN ? { "X-Subscription-Token": TOKEN } : {},
    });

    if (res.status === 429) {
      const wait = delay * Math.pow(2, i);
      console.log(`Rate limited, waiting ${wait}ms...`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }

    if (!res.ok) {
      throw new Error(`FIPE API error: ${res.status} ${res.statusText}`);
    }

    return res;
  }
  throw new Error("FIPE API: max retries exceeded");
}

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetchWithRetry(`${BASE_URL}/cars/brands`);
  const data = await res.json();
  return z.array(BrandSchema).parse(data);
}

export async function fetchModels(brandCode: string): Promise<Model[]> {
  const res = await fetchWithRetry(
    `${BASE_URL}/cars/brands/${brandCode}/models`
  );
  const data = await res.json();
  return z.array(ModelSchema).parse(data);
}

export async function fetchYears(
  brandCode: string,
  modelCode: number
): Promise<Year[]> {
  const res = await fetchWithRetry(
    `${BASE_URL}/cars/brands/${brandCode}/models/${modelCode}/years`
  );
  const data = await res.json();
  return z.array(YearSchema).parse(data);
}

export async function fetchCarDetails(
  brandCode: string,
  modelCode: number,
  yearCode: string
): Promise<CarDetail> {
  const res = await fetchWithRetry(
    `${BASE_URL}/cars/brands/${brandCode}/models/${modelCode}/years/${yearCode}`
  );
  const data = await res.json();
  const parsed = CarDetailSchema.parse(data);

  // Parse price string "R$ 135.990,00" to number
  const priceNum = parsePrice(parsed.price);
  return { ...parsed, priceNum };
}

function parsePrice(priceStr: string): number {
  const cleaned = priceStr
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/** Filter year codes to recent vehicles (2024+) */
export function isRecentYear(yearCode: string): boolean {
  const numericPart = parseInt(yearCode.split("-")[0], 10);
  return numericPart >= 2024 || numericPart === 32000;
}
