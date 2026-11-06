import type { Config } from "@react-router/dev/config";
import "dotenv/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  allowedActionOrigins:
    typeof process.env.BASE_URL === "undefined" || process.env.BASE_URL === ""
      ? process.env.NODE_ENV === "production"
        ? ["localhost"]
        : [`localhost:${process.env.PORT || 3000}`]
      : [process.env.BASE_URL.replace(/^https?:\/\//, "")],
} satisfies Config;
