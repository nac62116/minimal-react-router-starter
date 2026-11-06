import { z } from "zod";

// Typesafe environment variables on the server and public ones on the client. See entry.server.ts and root.ts for implementation.
// Usage:
// - Server: process.env.<ENV_VARIABLE>
// - Client: window.ENV.<ENV_VARIABLE> or ENV.<ENV_VARIABLE>

const schema = z
  .object({
    NODE_ENV: z.enum(["production", "development", "test"] as const),
    DOCKER_ENV: z.enum(["production", "development"] as const),
    BASE_URL: z.string(),
    PORT: z.string().optional(),
    SYSTEM_MAIL_SENDER: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    MAILER_HOST: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    MAILER_PORT: z
      .string()
      .optional()
      .transform((val) => {
        if (typeof val === "undefined" || val === "") return undefined;
        return parseInt(val, 10);
      }),
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
  .transform((env, ctx) => {
    let transformed = { ...env };
    if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
      transformed.BASE_URL = `http://localhost:${env.PORT || 3000}`;
    } else {
      if (env.DOCKER_ENV === "development") {
        transformed.BASE_URL = "https://localhost";
      } else {
        if (typeof env.BASE_URL === "undefined" || env.BASE_URL === "") {
          ctx.addIssue({
            code: "custom",
            message: "BASE_URL must be defined in production",
            path: ["BASE_URL"],
          });
          return z.NEVER;
        }
        transformed.BASE_URL = env.BASE_URL;
      }
    }
    if (typeof env.MAILER_HOST !== "undefined") {
      if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
        transformed.MAILER_HOST = "localhost";
      } else {
        if (env.DOCKER_ENV === "development") {
          transformed.MAILER_HOST = "mailpit";
        } else {
          transformed.MAILER_HOST = env.MAILER_HOST;
        }
      }
    }
    return transformed;
  });

type ParsedEnv = z.infer<typeof schema> & {
  BASE_URL: string;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ParsedEnv {}
  }
}

let env: ParsedEnv | undefined;

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
  env = parsed.data as ParsedEnv;
}

export function getServerEnv() {
  if (typeof env === "undefined") {
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
