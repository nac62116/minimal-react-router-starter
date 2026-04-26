import type { Route } from "./+types/csp-reports";

export const action = async (args: Route.ActionArgs) => {
  const { request } = args;
  const body = await request.json();
  // TODO: parse with zod and log when logging service is ready
  console.error("CSP Violation: ", body);
  return null;
};
