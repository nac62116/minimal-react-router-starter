import { type ActionFunctionArgs } from "react-router";

export const action = async (args: ActionFunctionArgs) => {
  const { request } = args;
  const body = await request.json();
  // TODO: parse with zod and log when logging service is ready
  return null;
};
