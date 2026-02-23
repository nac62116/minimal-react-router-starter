import { Link, useSearchParams } from "react-router";
import type { ArrayElement } from "../utils/types.server";
import { SUPPORTED_COOKIE_LANGUAGES } from "./i18n.shared";
import { extendSearchParams } from "../utils/search-params.shared";

export function LanguageSwitch(props: {
  currentLanguage: ArrayElement<typeof SUPPORTED_COOKIE_LANGUAGES>;
}) {
  const { currentLanguage } = props;

  const [searchParams] = useSearchParams();

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
              <Link
                to={`?${extendSearchParams(searchParams, {
                  addOrReplace: {
                    lng: language,
                  },
                })}`}
                preventScrollReset
                className="hover:underline hover:font-semibold"
              >
                {language.toUpperCase()}
              </Link>
            </li>
          );
        }
      )}
    </ul>
  );
}
