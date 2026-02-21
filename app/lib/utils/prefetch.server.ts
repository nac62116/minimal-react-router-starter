export function handlePrefetch(request: Request, responseHeaders?: Headers) {
  const extendedResponseHeaders = new Headers(responseHeaders);
  // Make prefetching work with a short lived cache header only on requests that have a prefetch purpose
  // see https://sergiodxa.com/tutorials/fix-double-data-request-when-prefetching-in-remix
  const isGet = request.method.toLowerCase() === "get";
  const purpose =
    request.headers.get("Purpose") ||
    request.headers.get("X-Purpose") ||
    request.headers.get("Sec-Purpose") ||
    request.headers.get("Sec-Fetch-Purpose") ||
    request.headers.get("Moz-Purpose");
  const isPrefetch = purpose === "prefetch";

  // If it's a GET request and it's a prefetch request and it doesn't have a Cache-Control header
  if (isGet && isPrefetch && !extendedResponseHeaders.has("Cache-Control")) {
    // we will cache for 10 seconds only on the browser
    extendedResponseHeaders.set("Cache-Control", "private, max-age=10");
  }
  return extendedResponseHeaders;
}
