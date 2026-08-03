import type { SearchDocument, SearchFilters, SearchResult } from "./types";

/**
 * The seam the search engine plugs into.
 *
 * Which client-side engine to use is still open (`IMP-004`, and the README in
 * this folder). This interface exists so that decision can be made later
 * without touching anything that calls search — the trigger for `IMP-004` is
 * content existing, and the engine should be chosen against a real index
 * rather than against 411 titles with nothing behind them.
 *
 * Everything runs in the reader's browser. No query ever leaves the machine
 * (`TEC-4`), which is why this interface has no notion of a request and no
 * async boundary that could quietly become one.
 */
export interface SearchEngine {
  /** Builds whatever internal structure the engine needs. Called once. */
  index(documents: readonly SearchDocument[]): void;
  query(text: string, filters?: SearchFilters): SearchResult[];
}

/**
 * Field weights.
 *
 * The order is from the search README and is the part worth preserving across
 * any engine change: a concept's one-sentence statement is the densest text
 * in the project, and body text is the noisiest. An engine that cannot express
 * per-field weighting is the wrong engine.
 */
export const FIELD_WEIGHTS = {
  statement: 10,
  title: 8,
  alias: 6,
  body: 1,
} as const;

/**
 * A deliberately plain matcher, standing in until the engine is chosen.
 *
 * Substring matching with field weights. No stemming, no fuzzy matching, no
 * tokenisation beyond splitting on whitespace. It is not what ships — it is
 * enough to build the search page against, and it makes the interface real
 * rather than hypothetical.
 *
 * Being obviously insufficient is a feature. A placeholder good enough to be
 * mistaken for finished is how the decision gets skipped.
 */
export class SubstringSearchEngine implements SearchEngine {
  private documents: readonly SearchDocument[] = [];

  index(documents: readonly SearchDocument[]): void {
    this.documents = documents;
  }

  query(text: string, filters: SearchFilters = {}): SearchResult[] {
    const needle = text.trim().toLowerCase();
    if (needle.length < 2) return [];

    const results: SearchResult[] = [];

    for (const document of this.documents) {
      if (!passesFilters(document, filters)) continue;

      const scored = scoreDocument(document, needle);
      if (scored) results.push({ ...document, ...scored });
    }

    // Score first, then title, so equal-scoring results have a stable order
    // rather than whatever the source happened to list first.
    return results.sort(
      (a, b) => b.score - a.score || a.title.localeCompare(b.title),
    );
  }
}

function passesFilters(
  document: SearchDocument,
  filters: SearchFilters,
): boolean {
  // Draft and deprecated material is excluded by default and labelled when
  // included. A reader should not be handed a draft as though it were settled
  // (`CST-010` §1).
  if (document.draft && !filters.includeDraft) return false;
  if (document.deprecated && !filters.includeDeprecated) return false;

  if (filters.kind && document.kind !== filters.kind) return false;
  if (filters.level && document.level !== filters.level) return false;

  return true;
}

function scoreDocument(
  document: SearchDocument,
  needle: string,
): Pick<SearchResult, "score" | "matchedOn"> | null {
  let score = 0;
  let matchedOn: SearchResult["matchedOn"] | undefined;

  const consider = (
    haystack: string | undefined,
    weight: number,
    field: NonNullable<SearchResult["matchedOn"]>,
  ) => {
    if (!haystack) return;
    const lower = haystack.toLowerCase();
    if (!lower.includes(needle)) return;

    // An exact match on the whole field beats a match buried inside it.
    score += lower === needle ? weight * 2 : weight;
    matchedOn ??= field;
  };

  consider(document.statement, FIELD_WEIGHTS.statement, "statement");
  consider(document.title, FIELD_WEIGHTS.title, "title");
  for (const alias of document.aliases) {
    consider(alias, FIELD_WEIGHTS.alias, "alias");
  }
  consider(document.body, FIELD_WEIGHTS.body, "body");

  return score > 0 ? { score, matchedOn } : null;
}
