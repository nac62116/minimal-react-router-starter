import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("*", "./routes/$.tsx"),
  route("csp-reports", "./routes/csp-reports.tsx"),
] satisfies RouteConfig;
