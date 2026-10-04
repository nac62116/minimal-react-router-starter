import "@fontsource/source-sans-pro/latin-400.css";
import "@fontsource/source-sans-pro/latin-600.css";
import "@fontsource/source-sans-pro/latin-700.css";
import "@fontsource/source-sans-pro/latin-900.css";
import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useSearchParams,
  useSubmit,
  type HeadersArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { getMessage } from "./lib/utils/message.server";
import { languageModuleMap } from "./lib/i18n/locales/.server";
import { detectLanguage, localeCookie } from "./lib/i18n/i18n.server";
import { DEFAULT_LANGUAGE } from "./lib/i18n/i18n.shared";
import { getEnv } from "./lib/utils/env.server";
import { useNonce } from "./lib/security/nonce-provider.shared";
import { csrf } from "./lib/security/csrf.server";
import { honeypot } from "./lib/security/honeypot.server";
import { HoneypotProvider } from "remix-utils/honeypot/react";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import { useMatomo, useMatomoPageView } from "./lib/analytics/matomo.shared";
import { combineHeaders } from "./lib/utils/headers.server";
import { handlePrefetch } from "./lib/utils/prefetch.server";
import { Message } from "./lib/components/examples/Message";
import { useEffect } from "react";

export const meta: MetaFunction<typeof loader> = (/*args*/) => {
  // Dynamic meta tags with loader data and parent loader data
  // const { loaderData } = args;

  return [
    { title: "Meta title" },
    {
      name: "description",
      property: "og:description",
      content: "Meta Description",
    },
    {
      name: "image",
      property: "og:image",
      content: `${ENV.BASE_URL}/images/example-image.jpg`,
    },
    {
      property: "og:image:secure_url",
      content: `${ENV.BASE_URL}/images/example-image.jpg`,
    },
    {
      property: "og:url",
      content: ENV.BASE_URL,
    },
  ];
};

export const headers = ({ loaderHeaders }: HeadersArgs) => {
  return loaderHeaders;
};

export const loader = async (args: LoaderFunctionArgs) => {
  const { request } = args;

  // CSRF and honeypot (see lib/security/csrf.server.ts and lib/security/honeypot.server.ts)
  const [csrfToken, csrfCookie] = await csrf.commitToken(request);
  const honeyProps = await honeypot.getInputProps();

  // Language and locales (see lib/i18n/i18n.server.ts, lib/i18n/i18n.shared.ts, lib/i18n/locales/.server/index.ts and the lib/i18n/locales/.server/<lng> folders)
  const language = await detectLanguage(request);
  const languageCookieHeaders = {
    "Set-Cookie": await localeCookie.serialize(language),
  };
  const locales = languageModuleMap[language].root;

  // Set message flash cookies to get a one time message on navigation. (see lib/utils/message.server.ts)
  const { message, headers: messageHeaders } = await getMessage(request);

  // Combining all response headers to set them later in one go (see lib/utils/headers.server.ts)
  const combinedHeaders = combineHeaders(
    csrfCookie ? { "set-cookie": csrfCookie } : null,
    languageCookieHeaders,
    messageHeaders
  );

  // Handle prefetch requests (see lib/utils/prefetch.server.ts) -> The function wont override existing Cache-Control headers
  const responseHeaders = handlePrefetch(request, combinedHeaders);

  // Public environment variables that you want to be available on the client (see env.server.ts and entry.server.ts)
  const ENV = getEnv();

  return data(
    {
      csrfToken,
      honeyProps,
      language,
      locales,
      message,
      ENV,
    },
    {
      headers: responseHeaders,
    }
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  // if there was an error running the loader, data could be missing
  const data = useLoaderData<typeof loader | null>();

  // The current location
  const location = useLocation();

  // nonce for CSP
  const nonce = useNonce();

  // Allow indexing (bots to crawl our website), which is important for SEO, but sometimes you may want to disable in development or test environments. See env.server.ts for details.
  const allowIndexing = data === null ? true : data.ENV.ALLOW_INDEXING;

  // Matomo analytics
  useMatomo({
    url: data?.ENV.MATOMO_URL,
    siteId: data?.ENV.MATOMO_SITE_ID,
    nonce,
  });
  useMatomoPageView({
    url: data?.ENV.MATOMO_URL,
    siteId: data?.ENV.MATOMO_SITE_ID,
    location,
  });

  return (
    <html lang={data?.language || DEFAULT_LANGUAGE}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {allowIndexing ? null : (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <Meta />
        {/* This fixes a hydration error on dev introduced by react 19.3.0. React Router does not yet provide a suppressHydrationWarning attribute on <Links/> */}
        <Links nonce={ENV.MODE === "production" ? nonce : ""} />
      </head>
      <body className="font-sans bg-white dark:bg-gray-950 text-neutral-600 dark:text-neutral-300">
        {children}
        {data !== null ? <Message message={data.message} /> : null}
        {data !== null ? (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
            }}
            suppressHydrationWarning
          />
        ) : null}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <HoneypotProvider {...data.honeyProps}>
      <AuthenticityTokenProvider token={data.csrfToken}>
        <Outlet />
      </AuthenticityTokenProvider>
    </HoneypotProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status.toString();
    details = error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  const browserNetworkErrors = [
    "Load failed",
    "Failed to fetch",
    "NetworkError when attempting to fetch resource",
    "Unable to decode turbo-stream response",
  ];
  const hasNetworkIssues = browserNetworkErrors.some((e) =>
    details.includes(e)
  );
  if (hasNetworkIssues) {
    message = "Network Error";
    details =
      "There seems to be a network issue. Please check your connection and try again.";
    stack = undefined;
  }
  const [searchParams] = useSearchParams();
  const currentRetry = searchParams.get("retry");
  const submit = useSubmit();
  useEffect(() => {
    if (hasNetworkIssues && currentRetry === null) {
      submit(
        {
          retry: 1,
        },
        { method: "GET", replace: true }
      ).catch(() => {});
    }
  }, [hasNetworkIssues, currentRetry, submit]);

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
