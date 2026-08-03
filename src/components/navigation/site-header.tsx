import Link from "next/link";

import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { SearchTrigger } from "./search-trigger";
import { ThemeSwitcher } from "./theme-switcher";
import type { Locale } from "@/config/i18n";
import { primaryNav } from "@/config/navigation";
import { editionHref } from "@/lib/content/edition";
import { siteConfig } from "@/config/site";

/**
 * Site header.
 *
 * Server component — only the three controls on the right hydrate. Doesn't
 * stick to the top: on a phone a fixed header eats reading area, and this is
 * a site people scroll through for twenty minutes at a time.
 *
 * `locale` decides where the nav points. A link to a page with a Bangla
 * counterpart keeps the reader in their edition; one without a counterpart
 * goes to the English page, because that is where it exists (`edition.ts`).
 */
export function SiteHeader({ locale = "en" }: { locale?: Locale } = {}) {
  return (
    <header className="border-border-subtle bg-surface-page border-b">
      <div className="container-page flex h-16 items-center gap-4 px-4">
        <Link href="/" className="font-semibold no-underline">
          {siteConfig.name}
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={editionHref(item.href, locale)}
                  matchNested
                  className="text-text-secondary hover:text-text-primary hover:bg-surface-sunken inline-flex h-9 items-center rounded-md px-3 text-sm no-underline transition-colors"
                  activeClassName="text-text-primary bg-surface-sunken"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchTrigger />
          <ThemeSwitcher />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
