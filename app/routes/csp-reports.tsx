import type { Route } from "./+types/csp-reports";

export const action = async (args: Route.ActionArgs) => {
  const { request } = args;
  const body = await request.json();
  // TODO: parse with zod and log when logging service is ready
  try {
    const cspJSON = JSON.stringify(body);
    console.error("CSP Violation: ", cspJSON);
  } catch {
    console.error("Error parsing CSP report");
  }
  return null;
};
