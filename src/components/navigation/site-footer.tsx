import Link from "next/link";

import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

/**
 * Footer.
 *
 * Comprehensive and quiet. This is also where the honest bits live — the
 * version, and the licence once we have one. No newsletter box, no social
 * row, no cookie banner (there's nothing to consent to).
 */
export function SiteFooter() {
  return (
    <footer className="border-border-subtle bg-surface-page mt-24 border-t">
      <div className="container-page px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerNav.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="text-text-primary mb-3 text-sm font-semibold">
                {group.heading}
              </h2>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-text-secondary hover:text-text-primary text-sm no-underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-border-subtle text-text-muted mt-10 flex flex-col gap-2 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            {siteConfig.name} — {siteConfig.descriptor}
          </p>
          <p>
            <span>Version {siteConfig.version}</span>
            {siteConfig.license ? (
              <>
                {" · "}
                <Link href="/license" className="no-underline">
                  {siteConfig.license.content} / {siteConfig.license.code}
                </Link>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </footer>
  );
}
