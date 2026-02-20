import { type ActionFunctionArgs } from "react-router";

export const action = async (args: ActionFunctionArgs) => {
  const { request } = args;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const body = await request.json();
  // TODO: parse with zod and log when logging service is ready
  return null;
};
