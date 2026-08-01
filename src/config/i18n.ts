/**
 * Locales.
 *
 * English lives at the root and Bangla sits under /bn, with the rest of the
 * path identical in both:
 *
 *   /learn/sessions/cookie-attributes
 *   /bn/learn/sessions/cookie-attributes
 *
 * Keeping the paths aligned means the language switcher can just add or strip
 * the prefix and land the reader on the same chapter instead of dumping them
 * on a home page.
 *
 * Only English routes exist so far. How we generate the /bn tree is still
 * undecided — see the README.
 */

export const locales = ["en", "bn"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeConfig: Record<
  Locale,
  {
    // Written in the language itself. No flags — a flag is a country, and
    // plenty of languages don't map to one.
    label: string;
    htmlLang: string;
    dir: "ltr" | "rtl";
    pathPrefix: string;
  }
> = {
  en: {
    label: "English",
    htmlLang: "en",
    dir: "ltr",
    pathPrefix: "",
  },
  bn: {
    label: "বাংলা",
    htmlLang: "bn",
    dir: "ltr",
    pathPrefix: "/bn",
  },
};

// Bangla ships with the foundational chapters only, so the UI has to be able
// to say "this one isn't translated yet, here's the English" rather than
// quietly 404ing or silently switching language on someone.
export const translationStatus: Record<Locale, "complete" | "partial"> = {
  en: "complete",
  bn: "partial",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
