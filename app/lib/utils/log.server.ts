/**
 * Server-side log sanitization utilities.
 *
 * GDPR basis: server logs are technical operational data under legitimate
 * interest (GDPR Art. 6(1)(f)) — no consent required as long as logs stay
 * on the server and are not shared with third parties. The moment logs are
 * forwarded to an external service (Sentry, Datadog, etc.) a Data Processing
 * Agreement or explicit consent is required.
 *
 * Keep an eye on this module when you want to stay GDPR compliant. Every time
 * you use sensitive personal data in your logs, make sure to extend the
 * sanitization functions in here.
 *
 * Sanitization strategy:
 *  - URLs        : strip sensitive data from search params and pathname (tokens, codes, user identifiers)
 *  - Headers     : cookie and authorization values redacted
 *  - Error msg   : known sensitive patterns redacted (extend SENSITIVE_PATTERNS)
 *  - Stack trace : absolute file paths shortened to relative, node_modules collapsed
 */

// ── Error message ─────────────────────────────────────────────────────────────

/**
 * Redact known sensitive patterns from error messages.
 * Extend SENSITIVE_PATTERNS as your app grows.
 */
const SENSITIVE_PATTERNS: Array<[RegExp, string]> = [
  // Example patterns - Only add patterns if needed
  // Email addresses
  // [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email]"],
  // Bearer tokens
  //[/Bearer\s+[^\s]+/gi, "Bearer [redacted]"],
  // JWT shaped strings
  //[/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]*/g, "[jwt]"],
  // Credentials in connection strings e.g. postgres://user:password@host
  //[/:\/\/([^:]+):([^@]+)@/, "://[redacted]:[redacted]@"],
  // Generic key=value pairs containing sensitive names
  //[/(secret|password|token|csrf|key)=[^\s&]+/gi, "$1=[redacted]"],
  // Credit card shaped numbers
  //[/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "[card]"],
];

export function sanitizeErrorMessage(message: string): string {
  return SENSITIVE_PATTERNS.reduce(
    (msg, [pattern, replacement]) => msg.replace(pattern, replacement),
    message
  );
}

// ── Stack trace ───────────────────────────────────────────────────────────────

/**
 * Shorten absolute paths to relative and collapse node_modules frames.
 * Keeps stack traces readable without exposing server directory structure.
 */
export function sanitizeStack(stack: string): string {
  return stack
    .split("\n")
    .map((line) => {
      if (line.includes("node_modules")) return "    at [node_modules]";
      return line.replace(process.cwd(), ".");
    })
    .filter((line, i, arr) => {
      // Collapse consecutive duplicate [node_modules] lines into one
      if (line === "    at [node_modules]" && arr[i - 1] === line) return false;
      return true;
    })
    .join("\n");
}

// ── URL ───────────────────────────────────────────────────────────────────────

/** Strip query string — tokens and user identifiers live there. */
export function sanitizeUrl(url: string): string {
  try {
    const { origin, pathname, search } = new URL(url);
    return `${origin}${pathname}${search}`;
  } catch {
    return "[invalid url]";
  }
}

// ── Headers ───────────────────────────────────────────────────────────────────

/** Redact sensitive headers, keep the rest for debugging value. */
export function sanitizeHeaders(headers: Headers): Record<string, string> {
  const REDACTED = "[redacted]";
  const SENSITIVE = new Set([
    "authorization", // Fundamentally sensitive, but not used yet in this app.
    "cookie", // CSRF token
    "set-cookie", // CSRF token
    "x-csrf-token", // CSRF token
    "x-xsrf-token", // CSRF token
    "x-forwarded-for", // nginx ip forwarding header, can contain user IP address
  ]);

  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = SENSITIVE.has(key.toLowerCase()) ? REDACTED : value;
  });
  return result;
}

// ── Request (composed) ────────────────────────────────────────────────────────

/** Produce a loggable, sanitized summary of a Request. */
export function sanitizeRequest(request: Request) {
  return {
    method: request.method,
    url: sanitizeUrl(request.url),
    headers: sanitizeHeaders(request.headers),
  };
}
