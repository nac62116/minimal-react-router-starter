import { useFetcher } from "react-router";
import type { ArrayElement } from "../utils/types.server";
import {
  LANGUAGE_COOKIE_NAME,
  SUPPORTED_COOKIE_LANGUAGES,
} from "./i18n.shared";

export function LanguageSwitch(props: {
  currentLanguage: ArrayElement<typeof SUPPORTED_COOKIE_LANGUAGES>;
}) {
  const { currentLanguage } = props;

  const fetcher = useFetcher();

  return (
    <ul>
      {SUPPORTED_COOKIE_LANGUAGES.map(
        (language: ArrayElement<typeof SUPPORTED_COOKIE_LANGUAGES>) => {
          return language === currentLanguage ? (
            <li key={language} className="font-semibold cursor-default">
              {currentLanguage.toUpperCase()}
            </li>
          ) : (
            <li key={language}>
              <fetcher.Form
                id={`locale-switch-form-${language}`}
                method="post"
                action="/switch-locale"
                hidden
                preventScrollReset
              />
              <button
                type="submit"
                form={`locale-switch-form-${language}`}
                name={LANGUAGE_COOKIE_NAME}
                value={language}
                className="hover:underline hover:font-semibold cursor-pointer"
              >
                {language.toUpperCase()}
              </button>
            </li>
          );
        }
      )}
    </ul>
  );
}
