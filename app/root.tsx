import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  type HeadersArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { combineHeaders } from "./utils/.server/headers";
import { getAlert } from "./alert.server";
import { getToast } from "./toast.server";
import { languageModuleMap } from "./locales/.server";
import { detectLanguage, localeCookie } from "./i18n.server";
import { DEFAULT_LANGUAGE } from "./i18n.shared";
import { getEnv } from "./env.server";
import { useNonce } from "./nonce-provider";

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
      // TODO: Use BASE_URL environment variable to construct the full URL for the image, when env.server.ts and ENV is ready
      content: "http://localhost:3000/images/example-image.jpg",
    },
    {
      property: "og:image:secure_url",
      // TODO: Use BASE_URL environment variable to construct the full URL for the image, when env.server.ts and ENV is ready
      content: "https://localhost:3000/images/example-image.jpg",
    },
    {
      property: "og:url",
      content: "http://localhost:3000/",
    },
  ];
};

export const headers = ({ loaderHeaders }: HeadersArgs) => {
  return loaderHeaders;
};

export const loader = async (args: LoaderFunctionArgs) => {
  const { request } = args;
  const language = await detectLanguage(request);
  const languageCookieHeaders = {
    "Set-Cookie": await localeCookie.serialize(language),
  };
  const locales = languageModuleMap[language].root;

  // Set alert and toast flash cookies to get a one time message on navigation.
  const { alert, headers: alertHeaders } = await getAlert(request);
  const { toast, headers: toastHeaders } = await getToast(request);

  // Make prefetching work with a short lived cache header only on requests that have a prefetch purpose
  // see https://sergiodxa.com/tutorials/fix-double-data-request-when-prefetching-in-remix
  const combinedHeaders = combineHeaders(
    alertHeaders,
    toastHeaders,
    languageCookieHeaders
  );
  const isGet = request.method.toLowerCase() === "get";
  const purpose =
    request.headers.get("Purpose") ||
    request.headers.get("X-Purpose") ||
    request.headers.get("Sec-Purpose") ||
    request.headers.get("Sec-Fetch-Purpose") ||
    request.headers.get("Moz-Purpose");
  const isPrefetch = purpose === "prefetch";

  // If it's a GET request and it's a prefetch request and it doesn't have a Cache-Control header
  if (isGet && isPrefetch && !combinedHeaders.has("Cache-Control")) {
    // we will cache for 10 seconds only on the browser
    combinedHeaders.set("Cache-Control", "private, max-age=10");
  }

  // Public environment variables that you want to be available on the client. Details in env.server.ts and entry.server.ts.
  const ENV = getEnv();

  return data(
    {
      language,
      locales,
      alert,
      toast,
      ENV,
    },
    {
      headers: combinedHeaders,
    }
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  // if there was an error running the loader, data could be missing
  const data = useLoaderData<typeof loader | null>();

  // nonce for CSP
  const nonce = useNonce();

  // Allow indexing (bots to crawl our website), which is important for SEO, but sometimes you may want to disable in development or test environments. See env.server.ts for details.
  const allowIndexing = data?.ENV.ALLOW_INDEXING === "true";

  return (
    <html lang={data?.language || DEFAULT_LANGUAGE}>
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {allowIndexing ? null : (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <Links nonce={nonce} />
      </head>
      <body className="font-sans bg-white dark:bg-gray-950 text-neutral-600 dark:text-neutral-300">
        {children}
        {data !== null ? (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
            }}
          />
        ) : null}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

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
