import { redirect, useLoaderData } from "react-router";
import { Dropdown } from "~/lib/components/examples/Dropdown";
import type { Route } from "./+types/_landing-page";
import { LanguageSwitch } from "~/lib/i18n/LanguageSwitch";
import { detectLanguage } from "~/lib/i18n/i18n.server";
import { languageModuleMap } from "~/lib/i18n/locales/.server";
import { getServerEnv } from "~/lib/utils/env.server";

// This is a playground route to show of concepts and test stuff

export const loader = async (args: Route.LoaderArgs) => {
  const { request } = args;
  if (getServerEnv().NODE_ENV === "production") {
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
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-3xl font-semibold">Example components</h1>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Language Switch</h2>
        <div className="flex flex-col gap-1">
          <LanguageSwitch currentLanguage={language} />
          <p>{locales.exampleLocale.title}</p>
          <p>{locales.exampleLocale.description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">
          Progressive enhanced Dropdown
        </h2>
        <Dropdown />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">
          Responsive Menu (f.e. Overlay on mobile, inline on desktop)
        </h2>
        <p>TODO</p>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">
          Form with redirect message (Stay on this page after success)
        </h2>
        <p>TODO</p>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">
          Form with redirect message (Redirect to different page after success)
        </h2>
        <p>TODO</p>
      </div>
    </div>
  );
}
