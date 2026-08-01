import type { ChapterId, Level, NodeId } from "@/types/content";

/**
 * Search types. No implementation yet — this is the shape the index has to
 * take, written down before anything builds against it.
 *
 * Two constraints drive the design and both are unusual:
 *
 * 1. Nothing leaves the browser. No hosted search service, so the index ships
 *    as a static artefact and queries run client-side. That caps how big it
 *    can get and rules out anything server-assisted.
 *
 * 2. It has to work for someone who doesn't know the word yet. Somebody
 *    searching "stay logged in" needs to land on sessions, and they will
 *    never type "session identifier". That's what `aliases` is for, and it's
 *    the difference between search working and search being decorative.
 */

export type SearchResultKind =
  "concept" | "chapter" | "glossary-term" | "example";

export interface SearchDocument {
  id: string;
  kind: SearchResultKind;
  title: string;
  /**
   * The one-sentence statement of what this is. Weighted highest — it's the
   * densest description we have of any concept, and it's what gets shown in
   * the result list.
   */
  statement: string;
  /** Full text, weighted lowest. */
  body?: string;
  /**
   * Phrasings a reader might actually use. Sourced from glossary alternate
   * names, deprecated terminology, and — most usefully — real queries that
   * returned nothing.
   */
  aliases: string[];
  href: string;
  chapter?: ChapterId;
  node?: NodeId;
  level?: Level;
  /** Excluded from results by default; included on request, labelled. */
  deprecated?: boolean;
  draft?: boolean;
}

export interface SearchFilters {
  part?: string;
  level?: Level;
  kind?: SearchResultKind;
  method?: string;
  threat?: string;
  includeDraft?: boolean;
  includeDeprecated?: boolean;
}

export interface SearchResult extends SearchDocument {
  score: number;
  /** Shown when the hit came from an alias rather than visible text, so the
      reader isn't left wondering why a result matched. */
  matchedOn?: "title" | "statement" | "alias" | "body";
}
