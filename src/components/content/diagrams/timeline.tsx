import type { ReactNode } from "react";

export interface TimelineStep {
  /** Short label. The step number comes from the list, not from here. */
  title: string;
  detail: ReactNode;
  /** Marks the step where something goes wrong, for attack walkthroughs. */
  danger?: boolean;
}

/**
 * An ordered sequence of steps.
 *
 * An <ol> with a line drawn down it, which matters: the order is real
 * information and a screen reader announces "3 of 7" for free. A row of
 * styled divs would lose that.
 *
 * Useful where a sequence diagram is overkill — a flow with one participant,
 * a lifecycle, the stages of an attack. If two parties are exchanging
 * messages, use SequenceDiagram instead; that's what it's for.
 */
export function Timeline({
  steps,
  caption,
}: {
  steps: TimelineStep[];
  caption?: string;
}) {
  return (
    <figure className="my-8">
      <ol className="border-border-subtle flex flex-col gap-6 border-l pl-6">
        {steps.map((step, index) => (
          <li key={step.title} className="relative">
            <span
              aria-hidden
              className={`border-surface-page absolute top-1 -left-[31px] flex size-5 items-center justify-center rounded-full border-4 text-[10px] font-semibold ${
                step.danger
                  ? "bg-status-danger text-text-inverse"
                  : "bg-border-strong text-text-inverse"
              }`}
            >
              {index + 1}
            </span>
            <p className="font-medium">{step.title}</p>
            <div className="text-text-secondary mt-1 text-sm [&>*:last-child]:mb-0">
              {step.detail}
            </div>
          </li>
        ))}
      </ol>
      {caption ? (
        <figcaption className="text-text-muted mt-3 text-sm">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
