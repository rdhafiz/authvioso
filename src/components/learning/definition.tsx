import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

/**
 * A term, defined inline where it's first used.
 *
 * Uses <dl> rather than a styled div because it genuinely is a definition
 * list — screen readers announce the relationship between the term and its
 * meaning, which a div can't convey.
 *
 * The definition here has to match the glossary word for word. Two slightly
 * different definitions of the same term is worse than one, because a reader
 * can't tell which is current and will assume the difference is meaningful.
 */
export function Definition({
  term,
  children,
  /** Glossary slug. Links out so the canonical entry stays the source. */
  href,
}: {
  term: string;
  children: ReactNode;
  href?: string;
}) {
  return (
    <dl className="border-border-strong my-6 border-l-4 py-1 pl-4">
      <dt className="mb-1 font-semibold">
        {href ? <Link href={`/glossary/${href}` as Route}>{term}</Link> : term}
      </dt>
      <dd className="text-text-secondary [&>*:last-child]:mb-0">{children}</dd>
    </dl>
  );
}
