import type { ReactNode } from "react";

/**
 * Wrapper for every diagram in the project.
 *
 * `alt` is a required prop, and that's the whole reason this component
 * exists. It's the one rule that gets skipped when a component makes it
 * optional, and a diagram nobody can read is a concept that's unreachable for
 * part of the audience.
 *
 * What goes in `alt` is not a caption. "Diagram of the authorization code
 * flow" describes the picture and conveys nothing. It needs the participants,
 * the order, and what each step carries — enough that someone who can't see
 * it follows the same argument.
 *
 * It renders in a <details> rather than being visually hidden. Sighted
 * readers use it too: it's often the clearest statement of what the diagram
 * is claiming, and hiding it wastes work that's already been done.
 */
export function Figure({
  children,
  caption,
  alt,
  /** Break out of the reading column. Diagrams need room; prose doesn't. */
  wide = false,
}: {
  children: ReactNode;
  /** What the diagram shows. Doesn't restate the surrounding explanation. */
  caption: string;
  alt: string;
  wide?: boolean;
}) {
  return (
    <figure className={wide ? "container-wide my-8" : "my-8"}>
      <div className="border-border-subtle bg-surface-raised overflow-x-auto rounded-md border p-4">
        {children}
      </div>

      <figcaption className="text-text-muted mt-2 text-sm">
        {caption}
      </figcaption>

      <details className="mt-2">
        <summary className="text-text-muted cursor-pointer text-sm">
          Text description
        </summary>
        <p className="text-text-secondary mt-2 text-sm">{alt}</p>
      </details>
    </figure>
  );
}
