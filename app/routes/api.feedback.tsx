import type { Route } from "./+types/api.feedback";
import { prisma } from "~/utils/db.server";

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const body = await request.json();
        const { carId, thumbs, weights } = body;

        if (!carId || thumbs === undefined) {
            return Response.json({ success: false, error: "Missing fields" }, { status: 400 });
        }

        await prisma.feedback.create({
            data: {
                carId,
                thumbs: !!thumbs,
                weights: JSON.stringify(weights || {}),
            }
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error("Feedback Error", error);
        return Response.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
