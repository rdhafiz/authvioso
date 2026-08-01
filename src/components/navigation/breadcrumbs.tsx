import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  /** Omitted on the last crumb — you don't link to where you already are. */
  href?: Route;
}

/**
 * Breadcrumbs.
 *
 * Shows where a page sits in the hierarchy, not how the reader got here.
 * History-based breadcrumbs are a different feature and a worse one.
 *
 * The matching JSON-LD is emitted separately by the page — see
 * lib/seo/structured-data.ts. Keeping them apart means the visual trail and
 * the markup can't silently disagree, because both are built from the same
 * crumb array.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="text-text-muted flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-text-primary no-underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "text-text-secondary" : undefined}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <ChevronRight className="size-3 shrink-0" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
