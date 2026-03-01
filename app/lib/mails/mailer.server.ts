import type Mail from "nodemailer/lib/mailer";
import fs from "fs-extra";
import Handlebars from "handlebars";
import { createTransport } from "nodemailer";
import { getServerEnv } from "../utils/env.server";

export const MAILER_OPTIONS = {
  host: getServerEnv().MAILER_HOST,
  port: getServerEnv().MAILER_PORT,
  auth: {
    user: getServerEnv().MAILER_USER,
    pass: getServerEnv().MAILER_PASS,
  },
} as const;

export async function mailer(options: {
  from: Mail.Options["from"];
  to: Mail.Options["to"];
  subject: Mail.Options["subject"];
  text: Mail.Options["text"];
  html: Mail.Options["html"];
}) {
  const { from, to, subject, text, html } = options;
  if (
    typeof MAILER_OPTIONS.host === "undefined" ||
    typeof MAILER_OPTIONS.port === "undefined"
  ) {
    console.warn(
      "Mailer host or port is not defined. Skipping sending email. Please set MAILER_HOST and MAILER_PORT env variables to enable email sending."
    );
    return;
  }
  const transporter = createTransport(
    typeof getServerEnv().MAILER_USER === "undefined" ||
      typeof getServerEnv().MAILER_PASS === "undefined"
      ? { host: MAILER_OPTIONS.host, port: MAILER_OPTIONS.port }
      : MAILER_OPTIONS
  );

  await transporter
    .sendMail({
      from,
      to,
      subject,
      text,
      html,
    })
    .catch((error) => {
      throw new Error(error);
    });
}

// Message configuration
type StandardMessageContent = {
  headline: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
  greetings: string;
};

type TemplatePath =
  | "app/lib/mails/templates/standard-message/html.hbs"
  | "app/lib/mails/templates/standard-message/text.hbs";

type TemplateContent<TemplatePath> = TemplatePath extends
  | "app/lib/mails/templates/standard-message/html.hbs"
  | "app/lib/mails/templates/standard-message/text.hbs"
  ? StandardMessageContent
  : never;

export async function getCompiledMailTemplate<T extends TemplatePath>(options: {
  templatePath: TemplatePath;
  content: TemplateContent<T>;
  type: "text" | "html";
}) {
  const { templatePath, content, type = "html" } = options;
  const bodyTemplateSource = await fs.readFile(templatePath, {
    encoding: "utf8",
  });
  const bodyTemplate = Handlebars.compile(bodyTemplateSource, {});
  const body = bodyTemplate(content);
  if (type === "text") {
    return body;
  }
  const baseUrl = getServerEnv().BASE_URL;
  const layoutTemplateSource = await fs.readFile(
    "app/lib/mails/templates/layout.hbs",
    {
      encoding: "utf8",
    }
  );
  const layoutTemplate = Handlebars.compile(layoutTemplateSource, {});
  Handlebars.registerPartial("body", body);
  const compiledHtml = layoutTemplate({ baseUrl });

  return compiledHtml;
}
