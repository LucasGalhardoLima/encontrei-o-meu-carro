import type { Route } from "./+types/api.cars";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const idsParam = url.searchParams.get("ids");

    if (!idsParam) {
        return { cars: [] };
    }

    const ids = idsParam.split(",").filter(Boolean);

    if (ids.length === 0) {
        return { cars: [] };
    }

    const cars = await prisma.car.findMany({
        where: {
            id: { in: ids }
        },
        include: {
            spec: true
        }
    });

    return { cars };
}
