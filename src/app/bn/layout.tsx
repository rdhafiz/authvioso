import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { localeConfig } from "@/config/i18n";

/**
 * The Bangla subtree.
 *
 * Carries the same chrome as `(site)/layout.tsx`. The Bangla tree sits outside
 * that route group — it has to, because `/bn` is a real path segment and
 * `(site)` is not — so the shell is repeated here rather than inherited. That
 * repetition is the cost `ADR-0011` accepted, and it is two components.
 *
 * `lang` and `dir` are declared on the wrapper. `lang` is valid on any element
 * and this satisfies WCAG 3.1.2, Language of Parts: assistive technology
 * reading anything in this tree switches to a Bangla voice rather than
 * pronouncing Bengali script as though it were English. globals.css keys the
 * Bengali face and its extra line height off `:lang(bn)`, so setting the
 * attribute is all that is needed for typography too.
 *
 * It does not yet satisfy 3.1.1, Language of Page, which is about `<html>` and
 * is set to `en` by the root layout. Fixing that means splitting into two root
 * layouts — Next allows one per route group, at the cost of a full page load
 * when crossing between them, which is what a language switch should do
 * anyway. Tracked as `IMP-008`, triggered by the first Bangla chapter
 * publishing; until something here renders Bangla prose it is a failure
 * nothing can hit.
 */
export default function BanglaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { htmlLang, dir } = localeConfig.bn;

  return (
    <div lang={htmlLang} dir={dir} className="flex min-h-dvh flex-col">
      <SiteHeader locale="bn" />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter locale="bn" />
    </div>
  );
}
