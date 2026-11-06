import type { $ZodConfig } from "zod/v4/core";

// This is loaded in root.tsx client side script to avoid csp unsafe eval issues with zods optimizations
export const ZOD_GLOBAL_CONFIG_KEY = "__zod_globalConfig";
export const ZOD_CONFIG: $ZodConfig = {
  jitless: true,
};
