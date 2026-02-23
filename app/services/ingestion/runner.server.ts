import { prisma } from "~/utils/db.server";
import { calculateScores, type RawSpec } from "~/utils/score.server";
import {
  fetchBrands,
  fetchModels,
  fetchYears,
  fetchCarDetails,
  isRecentYear,
} from "./parallelum.server";
import { matchInmetroEntry, type InmetroEntry } from "./inmetro.server";
import { enrichCarSpecs } from "./llm-enrichment.server";
import { fetchCarImage } from "./image-fetcher.server";

export type IngestionResult = {
  jobId: string;
  carsAdded: number;
  carsUpdated: number;
  carsSkipped: number;
  errors: string[];
};

/**
 * Run a full ingestion job.
 * Fetches from FIPE API, enriches with Inmetro + LLM, stores in DB.
 */
export async function runIngestionJob(
  inmetroEntries: InmetroEntry[] = []
): Promise<IngestionResult> {
  const job = await prisma.ingestionJob.create({
    data: { status: "running", startedAt: new Date() },
  });

  const result: IngestionResult = {
    jobId: job.id,
    carsAdded: 0,
    carsUpdated: 0,
    carsSkipped: 0,
    errors: [],
  };

  try {
    // Create log for FIPE source
    const fipeLog = await prisma.ingestionLog.create({
      data: {
        jobId: job.id,
        source: "parallelum-fipe",
        status: "running",
        startedAt: new Date(),
      },
    });

    const brands = await fetchBrands();
    console.log(`Found ${brands.length} brands`);

    for (const brand of brands) {
      try {
        const models = await fetchModels(brand.code);

        for (const model of models) {
          try {
            const years = await fetchYears(brand.code, model.code);
            const recentYears = years.filter((y) => isRecentYear(y.code));

            for (const year of recentYears) {
              try {
                const detail = await fetchCarDetails(
                  brand.code,
                  model.code,
                  year.code
                );

                // Skip if already exists or rejected
                const existingCar = await prisma.car.findUnique({
                  where: { fipe_code: detail.codeFipe },
                });
                if (existingCar) {
                  result.carsSkipped++;
                  continue;
                }

                const rejected = await prisma.rejectedCar.findUnique({
                  where: { fipe_code: detail.codeFipe },
                });
                if (rejected) {
                  result.carsSkipped++;
                  continue;
                }

                // Match Inmetro data
                const inmetro = matchInmetroEntry(
                  brand.name,
                  model.name,
                  inmetroEntries
                );

                // Enrich with LLM
                const enriched = await enrichCarSpecs(
                  brand.name,
                  model.name,
                  detail.modelYear
                );

                // Fetch image
                const imageUrl = await fetchCarImage(
                  brand.name,
                  model.name,
                  detail.modelYear,
                  enriched.body_type
                );

                // Build spec
                const rawSpec: RawSpec = {
                  trunk_liters: enriched.trunk_liters,
                  wheelbase: enriched.wheelbase,
                  ground_clearance: enriched.ground_clearance,
                  fuel_consumption_city:
                    inmetro?.fuel_consumption_city || 11.0,
                  hp: enriched.hp ?? undefined,
                  acceleration: enriched.acceleration ?? undefined,
                };

                const scores = calculateScores(rawSpec);

                await prisma.car.create({
                  data: {
                    brand: brand.name,
                    model: model.name,
                    year: detail.modelYear,
                    price_avg: detail.priceNum ?? 0,
                    type: enriched.body_type,
                    imageUrl,
                    fipe_code: detail.codeFipe,
                    moderation_status: "pending",
                    source: enriched.source,
                    source_data: {
                      fipe: detail,
                      inmetro: inmetro ?? undefined,
                      llm: enriched,
                    },
                    spec: {
                      create: {
                        ...rawSpec,
                        tank_capacity: enriched.tank_capacity,
                        fuel_consumption_highway:
                          inmetro?.fuel_consumption_highway ?? null,
                        fuel_type:
                          inmetro?.fuel_type || detail.fuel || "Flex",
                        transmission: enriched.transmission,
                        ...scores,
                      },
                    },
                  },
                });

                result.carsAdded++;
              } catch (err) {
                const msg = `Error processing ${brand.name} ${model.name} year ${year.code}: ${err}`;
                result.errors.push(msg);
                console.error(msg);
              }
            }
          } catch (err) {
            const msg = `Error fetching years for ${brand.name} ${model.name}: ${err}`;
            result.errors.push(msg);
          }
        }
      } catch (err) {
        const msg = `Error fetching models for ${brand.name}: ${err}`;
        result.errors.push(msg);
      }
    }

    // Update FIPE log
    await prisma.ingestionLog.update({
      where: { id: fipeLog.id },
      data: {
        status: "completed",
        itemsProcessed: result.carsAdded + result.carsSkipped,
        completedAt: new Date(),
        errors: result.errors.length > 0 ? result.errors : undefined,
      },
    });
  } catch (err) {
    const msg = `Critical ingestion error: ${err}`;
    result.errors.push(msg);
    console.error(msg);
  }

  // Finalize job
  await prisma.ingestionJob.update({
    where: { id: job.id },
    data: {
      status: result.errors.length > 0 ? "completed_with_errors" : "completed",
      completedAt: new Date(),
      carsAdded: result.carsAdded,
      carsUpdated: result.carsUpdated,
      carsSkipped: result.carsSkipped,
      errors: result.errors.length > 0 ? result.errors : undefined,
    },
  });

  return result;
}
