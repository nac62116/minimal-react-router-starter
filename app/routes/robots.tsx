import { getServerEnv } from "~/lib/utils/env.server";
import type { Route } from "./+types/robots";

export const loader = async (args: Route.LoaderArgs) => {
  if (getServerEnv().ALLOW_INDEXING === false) {
    return new Response("User-agent: *\nDisallow: /", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="robots.txt"`,
      },
    });
  }
  return new Response("Not found", {
    status: 404,
  });
};
