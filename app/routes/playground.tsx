import { redirect, useLoaderData } from "react-router";
import { Dropdown } from "~/lib/components/examples/Dropdown";
import type { Route } from "./+types/_landing-page";
import { LanguageSwitch } from "~/lib/i18n/LanguageSwitch";
import { detectLanguage } from "~/lib/i18n/i18n.server";
import { languageModuleMap } from "~/lib/i18n/locales/.server";

// This is a playground route to show of concepts and test stuff

export const loader = async (args: Route.LoaderArgs) => {
  const { request } = args;
  if (process.env.NODE_ENV === "production") {
    return redirect("/");
  }
  const language = await detectLanguage(request);
  const locales = languageModuleMap[language].root;
  return {
    language,
    locales,
  };
};

export default function Playground() {
  const { language, locales } = useLoaderData<typeof loader>();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Example components</h1>
      <h2 className="text-xl font-semibold mb-2">Language Switch</h2>
      <LanguageSwitch currentLanguage={language} />
      <p className="my-2">{locales.exampleLocale.title}</p>
      <p className="my-2">{locales.exampleLocale.description}</p>
      <h2 className="text-xl font-semibold mt-4 mb-2">
        Progressive enhanced Dropdown
      </h2>
      <Dropdown />
    </div>
  );
}
