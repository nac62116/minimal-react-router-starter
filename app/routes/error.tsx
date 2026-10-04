import { type ActionFunctionArgs } from "react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const error = formData.get("error");
  // TODO: parse with zod and log when logging service is ready
  if (typeof error !== "string") {
    console.error("Invalid error format");
    return null;
  } else {
    console.error(error);
  }
  return null;
};
