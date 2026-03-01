import type { Route } from "./+types/$";

export const loader = async (args: Route.LoaderArgs) => {
  return {
    message:
      "The 404 page doesn't exist yet. Create a redirect with message or a custom 404 page if you want more satisfaction.",
  };
};
