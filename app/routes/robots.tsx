import { getServerEnv } from "~/lib/utils/env.server";

export const loader = async () => {
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
