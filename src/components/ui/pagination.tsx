import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

/**
 * Previous / next pair.
 *
 * Both sides always name where they go. A bare "Next →" makes people click to
 * find out what's there, and it's useless to anyone tabbing through links out
 * of context.
 */

export interface PaginationLink {
  href: Route;
  label: string;
  /** Optional context line, e.g. which part the chapter belongs to. */
  meta?: string;
}

export function Pagination({
  previous,
  next,
}: {
  previous?: PaginationLink | null;
  next?: PaginationLink | null;
}) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Chapter"
      className="border-border-subtle mt-16 grid gap-4 border-t pt-8 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          href={previous.href}
          className="group border-border-subtle hover:border-border-strong flex flex-col gap-1 rounded-md border p-4 no-underline"
        >
          <span className="text-text-secondary flex items-center gap-1 text-sm">
            <ArrowLeft className="size-icon-xs" aria-hidden />
            Previous
          </span>
          <span className="text-text-primary font-medium">
            {previous.label}
          </span>
          {previous.meta ? (
            <span className="text-text-secondary text-sm">{previous.meta}</span>
          ) : null}
        </Link>
      ) : (
        // Keeps "next" in the right-hand column when there's no previous.
        <span aria-hidden />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group border-border-subtle hover:border-border-strong flex flex-col gap-1 rounded-md border p-4 text-right no-underline sm:col-start-2"
        >
          <span className="text-text-secondary flex items-center justify-end gap-1 text-sm">
            Next
            <ArrowRight className="size-icon-xs" aria-hidden />
          </span>
          <span className="text-text-primary font-medium">{next.label}</span>
          {next.meta ? (
            <span className="text-text-secondary text-sm">{next.meta}</span>
          ) : null}
        </Link>
      ) : null}
    </nav>
  );
}
