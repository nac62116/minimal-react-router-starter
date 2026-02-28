import { createCookieSessionStorage, redirect } from "react-router";
import { sanitizeUserHtml } from "./sanitize.server";
import { ZodError, z } from "zod";
import { combineHeaders } from "./headers.server";
import type { ArrayElement } from "./types.server";
import { getServerEnv } from "./env.server";

const MESSAGE_LEVELS = [
  "positive",
  "neutral",
  "attention",
  "negative",
] as const;

type Message = {
  message: string;
  key: string;
  id?: string;
  level?: ArrayElement<typeof MESSAGE_LEVELS>;
  isRichtext?: boolean;
  delayInMillis?: number | "persistent";
};

const DEFAULT_VALUES = {
  ID: "message",
  LEVEL: MESSAGE_LEVELS[0],
  IS_RICHTEXT: false,
  DELAY_IN_MILLIS: 5000,
} as const;

const MESSAGE_SESSION_KEY = "message";

const MESSAGE_SESSION_STORAGE = createCookieSessionStorage({
  cookie: {
    name: "message",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: getServerEnv().MESSAGE_SECRETS,
    secure: getServerEnv().NODE_ENV === "production",
  },
});

export async function redirectWithMessage(
  url: string,
  message: Message,
  redirectOptions?: {
    init?: ResponseInit;
  }
) {
  const baseUrl = getServerEnv().BASE_URL;
  let finalUrl;
  if (url.startsWith(baseUrl)) {
    finalUrl = new URL(url);
  } else {
    finalUrl = new URL(`${baseUrl}${url}`);
  }
  finalUrl.searchParams.set("message-trigger", message.key);

  return redirect(finalUrl.toString(), {
    ...redirectOptions?.init,
    headers: combineHeaders(
      redirectOptions?.init?.headers,
      await createMessageHeaders(message)
    ),
  });
}

export async function createMessageHeaders(message: Message) {
  const session = await MESSAGE_SESSION_STORAGE.getSession();
  const {
    id = DEFAULT_VALUES.ID,
    level = DEFAULT_VALUES.LEVEL,
    isRichtext = DEFAULT_VALUES.IS_RICHTEXT,
    delayInMillis = DEFAULT_VALUES.DELAY_IN_MILLIS,
  } = message;
  session.flash(MESSAGE_SESSION_KEY, {
    ...message,
    id,
    level,
    isRichtext,
    delayInMillis,
  });
  const cookie = await MESSAGE_SESSION_STORAGE.commitSession(session);
  return new Headers({ "set-cookie": cookie });
}

const messageSchema = z.object({
  message: z.string(),
  key: z.string(),
  id: z.string(),
  level: z.enum(MESSAGE_LEVELS),
  isRichtext: z.boolean(),
  delayInMillis: z
    .number()
    .min(0)
    .or(z.enum(["persistent"])),
});

export async function getMessage(request: Request) {
  const session = await MESSAGE_SESSION_STORAGE.getSession(
    request.headers.get("cookie")
  );
  const message = session.get(MESSAGE_SESSION_KEY);
  // Early return when cookie session is not set
  if (message === undefined || message === null) {
    return {
      message: null,
      headers: null,
    };
  }
  const sanitizedMessage = {
    ...message,
    message: sanitizeUserHtml(message.message),
  };
  // Parse data against the schema
  let finalMessage;
  try {
    finalMessage = messageSchema.parse(sanitizedMessage);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(
        "Validation errors while parsing the message cookie session:",
        error.message
      );
    } else {
      console.error(
        "Unexpected error during parsing the message cookie session:",
        error
      );
    }
    console.error("The message data was not returned.");
    return {
      message: null,
      headers: null,
    };
  }

  return {
    message: finalMessage,
    headers: new Headers({
      "set-cookie": await MESSAGE_SESSION_STORAGE.destroySession(session),
    }),
  };
}
