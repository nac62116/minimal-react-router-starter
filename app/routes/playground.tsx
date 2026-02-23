import { redirect } from "react-router";
import { Dropdown } from "~/lib/components/examples/Dropdown";
import type { Route } from "./+types/_landing-page";

// This is a playground route to show of concepts and test stuff

export const loader = async (args: Route.LoaderArgs) => {
  if (process.env.NODE_ENV === "production") {
    return redirect("/");
  }
  return null;
};

export default function Playground() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">
        Progressive enhanced Dropdown
      </h1>
      <Dropdown />
    </div>
  );
}
