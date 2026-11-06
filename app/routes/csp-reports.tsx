import type { Route } from "./+types/csp-reports";
import { safeStringify } from "../lib/utils/json.shared";

export const action = async (args: Route.ActionArgs) => {
  const { request } = args;
  const body = await request.json();
  // TODO: parse with zod and log when logging service is ready
  try {
    const cspJSON = safeStringify(body);
    console.error("CSP Violation: ", cspJSON);
  } catch {
    console.error("Error parsing CSP report");
  }
  return null;
};
