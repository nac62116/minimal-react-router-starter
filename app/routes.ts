import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_landing-page.tsx"),
  route("*", "./routes/$.tsx"),
  route("csp-reports", "./routes/csp-reports.tsx"),
  route("error", "./routes/error.tsx"),
  route("health", "./routes/health.tsx"),
  route("robots.txt", "./routes/robots.tsx"),
  route("switch-locale", "./routes/switch-locale.ts"),
  // Playground
  route("playground", "./routes/playground.tsx"),
] satisfies RouteConfig;
