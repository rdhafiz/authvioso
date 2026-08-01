import type { ReactNode } from "react";

/**
 * Chapter summary.
 *
 * Says what the reader can now do, not what the chapter said. A recap is
 * redundant for anyone who just read it and useless for anyone who didn't.
 *
 * Nothing new goes in here. If a fact only appears in the summary, it was
 * misplaced — put it in the explanation and let the summary point at it.
 *
 * Written so it works standalone, because experienced readers use summaries
 * as a review pass and never open the chapter body at all.
 */
export function Summary({
  children,
  /** The one trade-off the chapter turned on, in a line. */
  tradeoff,
}: {
  children: ReactNode;
  tradeoff?: ReactNode;
}) {
  return (
    <section
      aria-labelledby="chapter-summary"
      className="border-border-subtle bg-surface-raised mt-12 rounded-md border p-5"
    >
      <h2 id="chapter-summary" className="text-md mb-3 font-semibold">
        Summary
      </h2>
      <div className="[&>*:last-child]:mb-0 [&>ul]:mb-0">{children}</div>
      {tradeoff ? (
        <p className="border-border-subtle text-text-secondary mt-4 border-t pt-3 text-sm">
          <span className="font-semibold">The trade-off: </span>
          {tradeoff}
        </p>
      ) : null}
    </section>
  );
}
