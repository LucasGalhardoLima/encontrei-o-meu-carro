import type { Route } from "./+types/api.feedback";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "~/utils/db.server";

const FeedbackPayloadSchema = z.object({
  carId: z.string().uuid(),
  thumbs: z.boolean(),
  weights: z.record(z.string(), z.number().finite()).optional().default({}),
});

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  try {
    const payload = FeedbackPayloadSchema.safeParse(await request.json());
    if (!payload.success) {
      return Response.json(
        { success: false, error: "Invalid payload", issues: payload.error.issues },
        { status: 400 },
      );
    }

    const { carId, thumbs, weights } = payload.data;

    await prisma.feedback.create({
      data: {
        carId,
        thumbs,
        weights,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return Response.json({ success: false, error: "Invalid carId" }, { status: 400 });
    }

    console.error("Feedback Error", error);
    return Response.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
