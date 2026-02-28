import type { Route } from "./+types/health";

export const loader = async ({ request }: Route.LoaderArgs) => {
  return {
    message: "OK",
  };
};
