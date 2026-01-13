import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("results", "routes/results.tsx"),
  route("quiz", "routes/quiz.tsx"),
  route("compare", "routes/compare.tsx"),
  route("admin", "routes/admin.tsx"),
  route("carros/:brand/:slug", "routes/car_detail.tsx"),
  route("resource/og", "routes/resource.og.tsx"),
  route("api/feedback", "routes/api.feedback.tsx"),
] satisfies RouteConfig;
