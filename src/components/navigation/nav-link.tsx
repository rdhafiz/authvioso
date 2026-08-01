"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * A link that knows whether it's the current page.
 *
 * aria-current is the part that matters — the styling tells sighted users
 * where they are, and without this nobody else finds out.
 */
export function NavLink({
  href,
  children,
  className,
  activeClassName,
  /** Treat /learn as active on /learn/sessions/... too. */
  matchNested = false,
}: {
  href: Route;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  matchNested?: boolean;
}) {
  const pathname = usePathname();
  const isActive = matchNested
    ? pathname === href || pathname.startsWith(`${href}/`)
    : pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(className, isActive && activeClassName)}
    >
      {children}
    </Link>
  );
}
