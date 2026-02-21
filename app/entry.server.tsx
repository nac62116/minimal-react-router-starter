import { PassThrough } from "node:stream";

import {
  type AppLoadContext,
  type EntryContext,
  ServerRouter,
} from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import {
  type RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from "react-dom/server";
import { getEnv, init as initEnv } from "./env.server";
import { randomBytes } from "node:crypto";
import { createCSPHeaderOptions } from "./headers.server";
import { NonceProvider } from "./nonce-provider";

// Typesafe environment variables on the server and public ones on the client (See env.server.ts and root.tsx for details and usage)
initEnv();
global.ENV = getEnv();

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext
  // If you have middleware enabled:
  // loadContext: RouterContextProvider
) {
  // Nonce for CSP
  const nonce = randomBytes(16).toString("base64");

  // Security Header
  responseHeaders.set(
    "Reporting-Endpoints",
    `csp-endpoint='${process.env.BASE_URL}/csp-reports'`
  );
  const styleSrc = ["'self'"];
  if (process.env.NODE_ENV === "development") {
    styleSrc.push("'unsafe-inline'");
  }
  const cspHeaderOptions = createCSPHeaderOptions({
    "default-src": "'self'",
    "style-src": styleSrc.join(" "),
    "style-src-elem": styleSrc.join(" "),
    "script-src": `'self' 'nonce-${nonce}'`,
    "worker-src": "blob:",
    "object-src": "'none'",
    "form-action": "'self'",
    "base-uri": "'none'",
    "frame-ancestors": "'none'",
    "report-uri": `${process.env.BASE_URL}/csp-reports`,
    "report-to": "csp-endpoint",
    "upgrade-insecure-requests": process.env.NODE_ENV === "production",
  });
  responseHeaders.set("Content-Security-Policy", cspHeaderOptions);
  responseHeaders.set("X-Frame-Options", "DENY");
  responseHeaders.set("Referrer-Policy", "same-origin");

  // https://httpwg.org/specs/rfc9110.html#HEAD
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  }

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");

    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
    let readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    // Abort the rendering stream after the `streamTimeout` so it has time to
    // flush down the rejected boundaries
    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => abort(),
      streamTimeout + 1000
    );

    const { pipe, abort } = renderToPipeableStream(
      <NonceProvider value={nonce}>
        <ServerRouter context={routerContext} url={request.url} nonce={nonce} />
      </NonceProvider>,
      {
        nonce,
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              // Clear the timeout to prevent retaining the closure and memory leak
              clearTimeout(timeoutId);
              timeoutId = undefined;
              callback();
            },
          });
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          pipe(body);

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );
  });
}
