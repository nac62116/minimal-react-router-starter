import { Form, redirect, useLoaderData } from "react-router";
import { Dropdown } from "~/lib/components/examples/Dropdown";
import { LanguageSwitch } from "~/lib/i18n/LanguageSwitch";
import { detectLanguage } from "~/lib/i18n/i18n.server";
import { languageModuleMap } from "~/lib/i18n/locales/.server";
import { getCompiledMailTemplate, mailer } from "~/lib/mails/mailer.server";
import { getServerEnv } from "~/lib/utils/env.server";
import { invariantResponse } from "~/lib/utils/error.server";
import {
  redirectWithMessage,
  dataWithMessage,
} from "~/lib/utils/message.server";
import type { Route } from "./+types/_landing-page";

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

export const action = async (args: Route.ActionArgs) => {
  const { request } = args;
  if (getServerEnv().NODE_ENV === "production") {
    return redirect("/");
  }
  const formData = await request.formData();
  const shouldRedirect = formData.get("redirect");
  try {
    const textTemplatePath =
      "app/lib/mails/templates/standard-message/text.hbs";
    const content = {
      headline: "Test",
      message: "This is a test email.",
      buttonText: "Click me",
      buttonUrl: getServerEnv().BASE_URL,
      greetings: "Hello!",
    } as const;
    const text = await getCompiledMailTemplate<typeof textTemplatePath>({
      templatePath: textTemplatePath,
      type: "text",
      content,
    });
    const htmlTemplatePath =
      "app/lib/mails/templates/standard-message/html.hbs";
    const html = await getCompiledMailTemplate<typeof htmlTemplatePath>({
      templatePath: htmlTemplatePath,
      type: "html",
      content,
    });
    await mailer({
      from: "developer@example.com",
      to: "user@example.com",
      subject: "Test",
      text,
      html,
    });
  } catch (error) {
    console.error({ error });
    invariantResponse(false, "Server error", { status: 500 });
  }

  if (shouldRedirect === "true") {
    return redirectWithMessage("/", {
      key: `email-message-${Date.now()}`,
      delayInMillis: "persistent",
      message:
        "Test email sent successfully. You can view it in your configured smtp or in Mailpit on dev environment (http://localhost:8025).",
    });
  }

  return dataWithMessage(null, {
    key: `email-message-${Date.now()}`,
    message:
      "Test email sent successfully. You can view it in your configured smtp or in Mailpit on dev environment (http://localhost:8025).",
  });
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
        <h2 className="text-2xl font-semibold">Send test email</h2>
        <Form method="post">
          <button
            className="hover:underline hover:font-semibold cursor-pointer"
            type="submit"
          >
            Send test email and return with message
          </button>
        </Form>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Send test email</h2>
        <Form method="post">
          <input type="hidden" name="redirect" value="true" />
          <button
            className="hover:underline hover:font-semibold cursor-pointer"
            type="submit"
          >
            Send test email and redirect to / with persistent message
          </button>
        </Form>
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
