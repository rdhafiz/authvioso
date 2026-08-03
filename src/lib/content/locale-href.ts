import type { Route } from "next";

import { localeConfig, type Locale } from "@/config/i18n";

/**
 * Prefixes an internal path for an edition.
 *
 * English lives at the root and has no prefix; Bangla sits under `/bn`, with
 * the rest of the path identical (`D-0015`, `ADR-0011`). Every internal link
 * rendered inside a chapter goes through here, because the failure mode is
 * silent: a Bangla page linking to `/learn/...` looks fine and quietly walks
 * the reader out of their edition.
 *
 * The cast is unavoidable. `typedRoutes` verifies literals, and this composes
 * a path from a prefix chosen at runtime. Both trees are generated from the
 * same `generateStaticParams`, so every route this can produce does exist —
 * the compiler just has no way to know that.
 */
export function localeHref(path: string, locale: Locale): Route {
  return `${localeConfig[locale].pathPrefix}${path}` as Route;
}
