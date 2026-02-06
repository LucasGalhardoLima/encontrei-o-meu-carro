import type { Route } from "./+types/api.cars";
import { prisma } from "~/utils/db.server";

const CAR_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_IDS_PER_REQUEST = 20;

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids");

  if (!idsParam) {
    return Response.json({ cars: [] });
  }

  const ids = [...new Set(idsParam.split(",").map((id) => id.trim()))]
    .filter((id) => CAR_ID_REGEX.test(id))
    .slice(0, MAX_IDS_PER_REQUEST);

  if (ids.length === 0) {
    return Response.json({ cars: [] });
  }

  const cars = await prisma.car.findMany({
    where: {
      id: { in: ids },
    },
    include: {
      spec: true,
    },
  });

  return Response.json({ cars });
}
