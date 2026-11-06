import type { Config } from "@react-router/dev/config";
import "dotenv/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  allowedActionOrigins:
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
      ? [`localhost:${process.env.PORT || 3000}`]
      : process.env.DOCKER_ENV === "development"
        ? ["localhost"]
        : [process.env.BASE_URL.replace(/^https?:\/\//, "")],
} satisfies Config;
