import { CircleCheck, CircleX } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Best practices and common mistakes.
 *
 * Both have a required structure, and the structure is the point.
 *
 * A practice without its reason gets followed badly and abandoned the moment
 * it's inconvenient — so `reason` is not optional. A practice without its
 * conditions gets applied where it doesn't belong, which is why "always" is
 * a word to be suspicious of here.
 *
 * A mistake without "why it's tempting" is useless. Readers don't recognise
 * themselves in a list of things stupid people do; they recognise themselves
 * in something that looked correct at the time.
 */

export function BestPractice({
  children,
  reason,
  /** When this holds. Omit only if it genuinely always holds. */
  when,
}: {
  children: ReactNode;
  reason: ReactNode;
  when?: string;
}) {
  return (
    <div className="border-status-success/40 bg-status-success-surface my-6 rounded-md border p-4">
      <p className="text-status-success mb-2 flex items-center gap-2 text-sm font-semibold">
        <CircleCheck className="size-4 shrink-0" aria-hidden />
        Best practice
      </p>
      <div className="mb-3 font-medium [&>*:last-child]:mb-0">{children}</div>
      <p className="text-text-secondary text-sm">
        <span className="font-semibold">Why: </span>
        {reason}
      </p>
      {when ? (
        <p className="text-text-secondary mt-1 text-sm">
          <span className="font-semibold">When: </span>
          {when}
        </p>
      ) : null}
    </div>
  );
}

export function CommonMistake({
  /** The mistake, as it actually appears in real code. */
  children,
  /** What makes it look correct. Without this the reader won't see themselves. */
  tempting,
  /** The concrete failure — an attack, an outage, a support ticket. */
  consequence,
  /** What to do instead. */
  instead,
}: {
  children: ReactNode;
  tempting: ReactNode;
  consequence: ReactNode;
  instead: ReactNode;
}) {
  return (
    <div className="border-status-danger/40 bg-status-danger-surface my-6 rounded-md border p-4">
      <p className="text-status-danger mb-2 flex items-center gap-2 text-sm font-semibold">
        <CircleX className="size-4 shrink-0" aria-hidden />
        Common mistake
      </p>

      <div className="mb-3 font-medium [&>*:last-child]:mb-0">{children}</div>

      <dl className="text-text-secondary flex flex-col gap-2 text-sm">
        <div>
          <dt className="inline font-semibold">Why it&rsquo;s tempting: </dt>
          <dd className="inline">{tempting}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">What goes wrong: </dt>
          <dd className="inline">{consequence}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Do this instead: </dt>
          <dd className="inline">{instead}</dd>
        </div>
      </dl>
    </div>
  );
}
