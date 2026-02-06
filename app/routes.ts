import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("results", "routes/results.tsx"),
  route("quiz", "routes/quiz.tsx"),
  route("compare", "routes/compare.tsx"),
  route("garagem", "routes/garagem.tsx"),
  route("admin", "routes/admin.tsx"),
  route("admin/new", "routes/admin.new.tsx"),
  route("admin/:id", "routes/admin.$id.tsx"),
  route("carros/:id", "routes/carros.$id.tsx"),
  route("resource/og", "routes/resource.og.tsx"),
  route("api/cars", "routes/api.cars.tsx"),
  route("api/feedback", "routes/api.feedback.tsx"),
] satisfies RouteConfig;
