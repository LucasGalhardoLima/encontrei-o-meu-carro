import { z } from "zod";
import type { Route } from "./+types/api.feedback";
import { prisma } from "~/utils/db.server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const FeedbackSchema = z.object({
  carId: z.string().regex(UUID_REGEX, "Invalid car ID"),
  thumbs: z.boolean(),
  weights: z
    .object({
      comfort: z.number(),
      economy: z.number(),
      performance: z.number(),
      space: z.number(),
    })
    .optional(),
});

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = FeedbackSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { carId, thumbs, weights } = result.data;

  // Verify car exists and is approved
  const carCount = await prisma.car.count({
    where: { id: carId, moderation_status: "approved" },
  });
  if (carCount === 0) {
    return Response.json({ error: "Car not found" }, { status: 404 });
  }

  await prisma.feedback.create({
    data: {
      carId,
      thumbs,
      weights: weights ?? undefined,
    },
  });

  return Response.json({ success: true });
}
