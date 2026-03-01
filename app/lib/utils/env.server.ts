import { z } from "zod";

// Typesafe environment variables on the server and public ones on the client. See entry.server.ts and root.ts for implementation.
// Usage:
// - Server: process.env.<ENV_VARIABLE>
// - Client: window.ENV.<ENV_VARIABLE> or ENV.<ENV_VARIABLE>

const schema = z
  .object({
    NODE_ENV: z.enum(["production", "development", "test"] as const),
    BASE_URL: z.string().optional(),
    SYSTEM_MAIL_SENDER: z.string().min(1),
    MAILER_HOST: z.string().min(1),
    MAILER_PORT: z
      .string()
      .min(1)
      .transform((val) => parseInt(val, 10)),
    MAILER_USER: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    MAILER_PASS: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    ALLOW_INDEXING: z
      .string()
      .optional()
      .transform((val) => {
        if (typeof val === "undefined") return true;
        if (val === "") return true;
        return val === "true";
      }),
    MATOMO_URL: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    MATOMO_SITE_ID: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    SESSION_SECRETS: z
      .string()
      .min(1)
      .transform((val) => val.split(",")),
    HONEYPOT_SECRETS: z
      .string()
      .min(1)
      .transform((val) => val.split(",")),
    CSRF_SECRETS: z
      .string()
      .min(1)
      .transform((val) => val.split(",")),
    MESSAGE_SECRETS: z
      .string()
      .min(1)
      .transform((val) => val.split(",")),
  })
  .transform((env) => {
    if (typeof env.BASE_URL === "undefined" || env.BASE_URL === "") {
      if (env.NODE_ENV === "production") {
        env.BASE_URL = "https://localhost";
      } else {
        env.BASE_URL = "http://localhost:3000";
      }
    }
    return env;
  });

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

let env: z.infer<typeof schema>;

export function init() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:\n",
      parsed.error.issues
        .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")
    );

    throw new Error("Invalid environment variables");
  }
  env = parsed.data;
}

export function getServerEnv() {
  if (!env) {
    throw new Error(
      "Environment variables not initialized. Call init() first."
    );
  }
  return env;
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
  return {
    MODE: getServerEnv().NODE_ENV,
    BASE_URL: getServerEnv().BASE_URL,
    ALLOW_INDEXING: getServerEnv().ALLOW_INDEXING,
    MATOMO_URL: getServerEnv().MATOMO_URL,
    MATOMO_SITE_ID: getServerEnv().MATOMO_SITE_ID,
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
