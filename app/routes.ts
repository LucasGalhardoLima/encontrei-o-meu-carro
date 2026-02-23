import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("quiz", "routes/quiz.tsx"),
  route("results", "routes/results.tsx"),
  route("carros/:id", "routes/car-detail.tsx"),
  route("compare", "routes/compare.tsx"),
  route("garagem", "routes/garage.tsx"),
  route("admin", "routes/admin.tsx"),
  route("admin/cars/new", "routes/admin.cars.new.tsx"),
  route("admin/cars/:id", "routes/admin.cars.$id.tsx"),
  route("api/cars", "routes/api.cars.tsx"),
  route("api/cars/search", "routes/api.cars.search.tsx"),
  route("api/feedback", "routes/api.feedback.tsx"),
  route("resource/og", "routes/resource.og.tsx"),
] satisfies RouteConfig;
