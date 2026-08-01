import { Figure } from "./figure";
import { Mermaid } from "./mermaid";

/**
 * The named diagram types.
 *
 * All Mermaid underneath, differing only in which Mermaid grammar they use
 * and what they're for. They exist as separate components so a chapter says
 * `<SequenceDiagram>` rather than `<Mermaid chart="sequenceDiagram…">` — the
 * name tells the next person what kind of claim the picture is making, and it
 * keeps the vocabulary in the chapter matching the vocabulary in the specs.
 *
 * Every one requires `alt` because <Figure> requires it.
 */

interface DiagramProps {
  chart: string;
  caption: string;
  alt: string;
  wide?: boolean;
}

/** A request/response path between parties. Order is implied, not numbered. */
export function FlowDiagram({ chart, caption, alt, wide }: DiagramProps) {
  return (
    <Figure caption={caption} alt={alt} wide={wide}>
      <Mermaid chart={chart} />
    </Figure>
  );
}

/**
 * Ordered exchanges over time, with the steps numbered.
 *
 * The right choice whenever the order *is* the lesson — which covers most of
 * the protocol chapters.
 */
export function SequenceDiagram({ chart, caption, alt, wide }: DiagramProps) {
  return (
    <Figure caption={caption} alt={alt} wide={wide}>
      <Mermaid chart={chart} />
    </Figure>
  );
}

/** Components and their relationships, with no time dimension. */
export function ArchitectureDiagram({
  chart,
  caption,
  alt,
  wide,
}: DiagramProps) {
  return (
    <Figure caption={caption} alt={alt} wide={wide}>
      <Mermaid chart={chart} />
    </Figure>
  );
}

/**
 * How concepts relate to each other.
 *
 * Use sparingly. A map of everything is a hairball, and it's usually a sign
 * that the thing wanted splitting into three diagrams that each say one
 * thing.
 */
export function ConceptMap({ chart, caption, alt, wide }: DiagramProps) {
  return (
    <Figure caption={caption} alt={alt} wide={wide}>
      <Mermaid chart={chart} />
    </Figure>
  );
}
