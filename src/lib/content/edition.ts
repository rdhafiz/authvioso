import type { Route } from "next";

import type { Locale } from "@/config/i18n";

/**
 * Which paths exist in the Bangla tree.
 *
 * `D-0015` gives Bangla a parallel route tree, and `PRJ-004` §3.8 scopes the
 * v1.0 Bangla edition to the foundational modules — the curriculum, not the
 * whole site. So `/learn/**` exists in both editions and everything else
 * exists only in English.
 *
 * That makes an internal link one of two things, and getting it wrong is
 * invisible either way:
 *
 * - A path that exists in both. Keep the reader in their edition.
 * - A path that exists only in English. Link to it unprefixed, because a
 *   prefixed version would 404.
 *
 * One list, used by the header, the footer, the sidebar and the sitemap.
 * Keeping it in four places is how they start disagreeing, and the symptom is
 * a reader silently dropped out of the Bangla edition by a nav link.
 *
 * Add a prefix here when the Bangla tree grows. It is deliberately a list
 * someone edits rather than an assumption that both editions match.
 */
export const translatedPrefixes = ["/learn"] as const;

export function existsInEdition(path: string, locale: Locale): boolean {
  if (locale === "en") return true;
  return translatedPrefixes.some((prefix) => path.startsWith(prefix));
}

/**
 * Resolves an internal link for the edition the reader is in.
 *
 * Falls back to the English path when the target has no counterpart, which is
 * the honest outcome: the reader is leaving the Bangla edition because there
 * is nothing there to go to, and a 404 would be a worse way to tell them.
 */
export function editionHref(path: string, locale: Locale): Route {
  return (
    existsInEdition(path, locale) && locale === "bn" ? `/bn${path}` : path
  ) as Route;
}

/**
 * The edition a pathname belongs to.
 *
 * For client components that render in both trees and have no locale prop.
 * Reading it from the URL means it cannot disagree with the page the reader is
 * actually on.
 */
export function localeFromPathname(pathname: string): Locale {
  return pathname === "/bn" || pathname.startsWith("/bn/") ? "bn" : "en";
}
