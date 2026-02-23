import type { Config } from "@react-router/dev/config";

const staticRoutes = ["/"];

if (process.env.NODE_ENV !== "production") {
  staticRoutes.push("/playground");
}

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  prerender: staticRoutes,
} satisfies Config;
