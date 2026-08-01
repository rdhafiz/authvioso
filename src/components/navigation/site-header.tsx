import Link from "next/link";

import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { SearchTrigger } from "./search-trigger";
import { ThemeSwitcher } from "./theme-switcher";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

/**
 * Site header.
 *
 * Server component — only the three controls on the right hydrate. Doesn't
 * stick to the top: on a phone a fixed header eats reading area, and this is
 * a site people scroll through for twenty minutes at a time.
 */
export function SiteHeader() {
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
                  href={item.href}
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
