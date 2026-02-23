import { z } from "zod";

const EnrichedSpecsSchema = z.object({
  tank_capacity: z.number().min(0).default(0),
  trunk_liters: z.number().min(0).default(0),
  wheelbase: z.number().min(0).default(0),
  ground_clearance: z.number().min(0).default(0),
  hp: z.number().min(0).nullable().default(null),
  acceleration: z.number().min(0).nullable().default(null),
  transmission: z.string().default("Automático"),
  body_type: z.string().default("Hatch"),
});

export type EnrichedSpecs = z.infer<typeof EnrichedSpecsSchema>;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = "claude-haiku-4-5-20251001";

/**
 * Enrich car specs using Claude API.
 * Returns structured specs for a given car.
 */
export async function enrichCarSpecs(
  brand: string,
  model: string,
  year: number
): Promise<EnrichedSpecs & { source: string }> {
  if (!ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set, returning defaults");
    return {
      ...getDefaults(brand, model),
      source: "default",
    };
  }

  const prompt = `You are a Brazilian automotive data expert. For the ${year} ${brand} ${model} sold in Brazil, provide the following specifications as JSON. Use the most common trim/version. All values should be for the Brazilian market version.

Return ONLY valid JSON with these fields:
{
  "tank_capacity": <fuel tank in liters, integer>,
  "trunk_liters": <trunk/cargo volume in liters, integer>,
  "wheelbase": <wheelbase in meters, decimal like 2.65>,
  "ground_clearance": <ground clearance in mm, integer>,
  "hp": <horsepower, integer or null if unknown>,
  "acceleration": <0-100 km/h in seconds, decimal or null if unknown>,
  "transmission": <"Manual" or "Automático" or "CVT">,
  "body_type": <"Hatch", "Sedan", "SUV", "Picape", "Minivan">
}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error(`LLM API error: ${res.status}`);
      return { ...getDefaults(brand, model), source: "default" };
    }

    const data = await res.json();
    const text =
      data.content?.[0]?.type === "text" ? data.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in LLM response");
      return { ...getDefaults(brand, model), source: "default" };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = EnrichedSpecsSchema.parse(parsed);

    return { ...validated, source: "ai-enriched" };
  } catch (error) {
    console.error("LLM enrichment failed:", error);
    return { ...getDefaults(brand, model), source: "default" };
  }
}

function getDefaults(_brand: string, _model: string): EnrichedSpecs {
  return {
    tank_capacity: 50,
    trunk_liters: 350,
    wheelbase: 2.6,
    ground_clearance: 170,
    hp: null,
    acceleration: null,
    transmission: "Automático",
    body_type: "Hatch",
  };
}
