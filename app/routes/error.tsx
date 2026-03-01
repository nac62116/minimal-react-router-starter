import type { Route } from "./+types/error";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const error = formData.get("error");
  // TODO: parse with zod and log when logging service is ready
  return null;
};
