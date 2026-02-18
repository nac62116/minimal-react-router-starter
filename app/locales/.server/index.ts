/* ar */
import { locale as arExampleFromFolderLocale } from "./ar/example-locale-folder/example";
import { locale as arExampleLocale } from "./ar/example";
/* de */
import { locale as deExampleFromFolderLocale } from "./de/example-locale-folder/example";
import { locale as deExampleLocale } from "./de/example";
/* en */
import { locale as enExampleFromFolderLocale } from "./en/example-locale-folder/example";
import { locale as enExampleLocale } from "./en/example";

/**
 * This is the map of all language modules.
 *
 * The key is the language code in combination with the route pathname.
 * The values are fully typed locales from those routes.
 *
 * To add a new language following steps are required:
 *
 * 1. Copy an existing language folder and rename it to the new language code.
 * 2. Translate all files in the new language folder.
 * 3. Add the new language to the `supportedCookieLanguages` array in `i18n.shared.ts`.
 * - Dont panic if all modules have type errors, the next steps fix these.
 * 4. Add the new language to the `supportedHeaderLanguages` array and transform them into a single value inside the schema in `i18n.server.ts`.
 * - Full list: https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
 * - Comprehensive list (more grouped): https://www.niefuend.org/blog/internet/2017/10/alle-accept-language-codes-mit-laendernamen/
 * 4. Add the new language modules to the `languageModuleMap` object below. (Copilot can help with this)
 *
 * Hint: Placement of below language modules defines the order of the TypeScript hovering hints.
 */

const de = {
  // root
  root: {
    exampleLocale: deExampleLocale,
    anotherExampleLocale: deExampleFromFolderLocale,
  },
} as const;

const en = {
  // root
  root: {
    exampleLocale: enExampleLocale,
    anotherExampleLocale: enExampleFromFolderLocale,
  },
} as const;

const ar = {
  // root
  root: {
    exampleLocale: arExampleLocale,
    anotherExampleLocale: arExampleFromFolderLocale,
  },
} as const;

export const languageModuleMap = {
  ar,
  de,
  en,
} as const;
