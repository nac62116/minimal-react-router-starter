export function combineHeaders(
  ...headers: Array<ResponseInit["headers"] | null>
) {
  const combined = new Headers();
  for (const header of headers) {
    if (!header) continue;
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value);
    }
  }
  return combined;
}

// Add more if needed
type CSPHeaderOptions =
  | "default-src"
  | "style-src"
  | "style-src-elem"
  | "script-src"
  | "worker-src"
  | "frame-src"
  | "object-src"
  | "form-action"
  | "base-uri"
  | "frame-ancestors"
  | "report-uri"
  | "report-to"
  | "upgrade-insecure-requests";

export function createCSPHeaderOptions(
  options: Partial<{ [key in CSPHeaderOptions]: string | boolean }>
) {
  const cspOptions = Object.entries(options)
    .map((entry) => {
      const [key, value] = entry;
      if (typeof value === "boolean") {
        return value ? key.trim() : null;
      }
      return `${key} ${value}`.trim();
    })
    .filter((option) => {
      return option !== null;
    })
    .join("; ");
  return `${cspOptions};`;
}
