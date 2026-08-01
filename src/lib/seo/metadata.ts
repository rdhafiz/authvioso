import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { defaultLocale, localeConfig, type Locale } from "@/config/i18n";

/**
 * Metadata helpers.
 *
 * Everything here is plumbing — canonical URLs, hreflang, OG tags. None of it
 * should ever influence what we write or how a page is structured. If a
 * decision about the content gets made for search reasons, that's the bug.
 */

interface BuildMetadataOptions {
  /** Keep under ~60 chars and match the page's own h1. */
  title: string;
  /** Written for a person scanning results. Auto-extracting the first
      paragraph gives you something that rarely describes the page. */
  description?: string;
  /** Path without the locale prefix, e.g. "/learn/sessions". */
  path?: string;
  locale?: Locale;
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  type?: "website" | "article";
}

function canonicalFor(path: string, locale: Locale): string {
  const prefix = localeConfig[locale].pathPrefix;
  const normalised = path === "/" ? "" : path;
  return `${prefix}${normalised}` || "/";
}

/**
 * Builds a page's metadata, including the hreflang cluster.
 *
 * The hreflang bit isn't optional decoration: without it the English and
 * Bangla versions of the same chapter compete with each other in search
 * results, and Google picks a winner more or less at random.
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  locale = defaultLocale,
  noIndex = false,
  publishedTime,
  modifiedTime,
  type = "website",
}: BuildMetadataOptions): Metadata {
  const canonical = canonicalFor(path, locale);

  const languages: Record<string, string> = {};
  for (const [code, config] of Object.entries(localeConfig)) {
    languages[config.htmlLang] = canonicalFor(path, code as Locale);
  }
  languages["x-default"] = canonicalFor(path, defaultLocale);

  return {
    title,
    description,
    alternates: { canonical, languages },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type,
      siteName: siteConfig.name,
      title,
      description,
      url: canonical,
      locale: localeConfig[locale].htmlLang,
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Applied at the root. metadataBase is what lets every other file use
 * relative paths and still emit absolute URLs.
 */
export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: {
    default: `${siteConfig.name} — ${siteConfig.descriptor}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  // Credited to the project rather than a person. Individual posts on the
  // blog will override this.
  authors: [{ name: siteConfig.name, url: siteConfig.origin }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.descriptor}`,
    description: siteConfig.description,
    url: "/",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.descriptor}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};
