import type { MetadataRoute } from "next";

import { defaultLocale, localeConfig, locales } from "@/config/i18n";
import { noIndexRoutes } from "@/config/navigation";
import { existsInEdition } from "@/lib/content/edition";
import { siteConfig } from "@/config/site";

// Chapter, glossary and path URLs get appended to this once the content graph
// exists. Keeping it generated rather than hand-written matters: a stale
// sitemap full of 404s is a decent signal that nobody's maintaining the site.
const staticRoutes = [
  "/",
  "/learn",
  "/chapters",
  "/paths",
  "/glossary",
  "/examples",
  "/progress",
  "/certificate",
  "/about",
  "/vision",
  "/principles",
  "/scope",
  "/faq",
  "/contributing",
  "/standards",
  "/changelog",
  "/license",
] as const;

function isExcluded(route: string): boolean {
  return noIndexRoutes.some((excluded) => route.startsWith(excluded));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteConfig.origin;

  return staticRoutes
    .filter((route) => !isExcluded(route))
    .map((route) => {
      const path = route === "/" ? "" : route;

      const languages: Record<string, string> = {};
      for (const locale of locales) {
        if (!existsInEdition(route, locale)) continue;
        languages[localeConfig[locale].htmlLang] =
          `${origin}${localeConfig[locale].pathPrefix}${path}` || origin;
      }

      return {
        url: `${origin}${path}` || origin,
        // No lastModified yet. Once chapters exist it should be the real
        // review date — inventing one now would make every page look freshly
        // checked when none of them have been.
        alternates: {
          languages: {
            ...languages,
            "x-default": `${origin}${localeConfig[defaultLocale].pathPrefix}${path}`,
          },
        },
      };
    });
}
