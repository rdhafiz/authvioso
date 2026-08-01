import type { Route } from "next";

import { chapters, parts, type ChapterMeta, type PartMeta } from "./curriculum";
import type { ChapterId, PartId } from "@/types/content";

/**
 * Lookups over the curriculum.
 *
 * All synchronous and all pure — the structure is a static import, so nothing
 * here needs to be async or cached. That changes if the curriculum ever moves
 * to a data file, in which case this is the only module that has to.
 */

const chaptersById = new Map(chapters.map((c) => [c.id, c]));
const chaptersBySlug = new Map(chapters.map((c) => [c.slug, c]));
const partsById = new Map(parts.map((p) => [p.id, p]));
const partsBySlug = new Map(parts.map((p) => [p.slug, p]));

export function getPart(idOrSlug: string): PartMeta | undefined {
  return partsById.get(idOrSlug as PartId) ?? partsBySlug.get(idOrSlug);
}

export function getChapter(idOrSlug: string): ChapterMeta | undefined {
  return (
    chaptersById.get(idOrSlug as ChapterId) ?? chaptersBySlug.get(idOrSlug)
  );
}

export function getChaptersInPart(partId: PartId): ChapterMeta[] {
  return chapters.filter((c) => c.part === partId);
}

export function getAllParts(): readonly PartMeta[] {
  return parts;
}

export function getAllChapters(): readonly ChapterMeta[] {
  return chapters;
}

/** Total reading time for a part, in minutes. */
export function getPartReadingTime(partId: PartId): number {
  return getChaptersInPart(partId).reduce((sum, c) => sum + c.readingTime, 0);
}

/**
 * Previous and next in reading order.
 *
 * Deliberately runs across part boundaries — the last chapter of P3 points at
 * the first of P4 rather than dead-ending, and the UI adds the "end of part"
 * framing on top.
 */
export function getChapterNeighbours(id: ChapterId): {
  previous: ChapterMeta | null;
  next: ChapterMeta | null;
} {
  const index = chapters.findIndex((c) => c.id === id);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: chapters[index - 1] ?? null,
    next: chapters[index + 1] ?? null,
  };
}

/** Direct prerequisites, resolved to chapters. */
export function getPrerequisites(id: ChapterId): ChapterMeta[] {
  const chapter = chaptersById.get(id);
  if (!chapter) return [];
  return chapter.requires
    .map((req) => chaptersById.get(req))
    .filter((c): c is ChapterMeta => Boolean(c));
}

/**
 * Everything that lists this chapter as a prerequisite.
 *
 * Useful for "what this unlocks", and for spotting the chapters that carry the
 * most weight — C02, C05 and C43 have far more dependants than anything else,
 * which is a decent proxy for where review effort belongs.
 */
export function getDependants(id: ChapterId): ChapterMeta[] {
  return chapters.filter((c) => c.requires.includes(id));
}

/**
 * Walks prerequisites all the way back to an entry point.
 *
 * This is what powers "you're missing three things" when someone lands on a
 * chapter from a search result. Breadth-first so the nearest gaps come first,
 * and the visited set stops us looping on the diamond shapes in the graph
 * (C28 reaches C02 by two different routes).
 */
export function getPrerequisiteChain(id: ChapterId): ChapterMeta[] {
  const seen = new Set<ChapterId>([id]);
  const out: ChapterMeta[] = [];
  const queue: ChapterId[] = [...(chaptersById.get(id)?.requires ?? [])];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);

    const chapter = chaptersById.get(current);
    if (!chapter) continue;

    out.push(chapter);
    queue.push(...chapter.requires);
  }

  // Back into reading order, otherwise the list arrives in traversal order and
  // reads as arbitrary.
  return out.sort(
    (a, b) =>
      chapters.findIndex((c) => c.id === a.id) -
      chapters.findIndex((c) => c.id === b.id),
  );
}

/**
 * Related chapters, for the "see also" block.
 *
 * Cheap heuristic for now: prerequisites, direct dependants, and part
 * siblings, in that order. Once the knowledge graph has real `contrasts-with`
 * and `threatens` edges this should read those instead — the interesting
 * relationships aren't the hierarchical ones.
 */
export function getRelatedChapters(id: ChapterId, limit = 5): ChapterMeta[] {
  const chapter = chaptersById.get(id);
  if (!chapter) return [];

  const seen = new Set<ChapterId>([id]);
  const related: ChapterMeta[] = [];

  for (const candidate of [
    ...getPrerequisites(id),
    ...getDependants(id),
    ...getChaptersInPart(chapter.part),
  ]) {
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    related.push(candidate);
    if (related.length >= limit) break;
  }

  return related;
}

/** Position in the curriculum, for the progress readout. */
export function getChapterPosition(id: ChapterId): {
  index: number;
  total: number;
} {
  return {
    index: chapters.findIndex((c) => c.id === id) + 1,
    total: chapters.length,
  };
}

/**
 * Typed so callers can hand the result straight to <Link>.
 *
 * typedRoutes can't verify a runtime-built path, hence the assertion. It's
 * safe because both segments come from the curriculum data — but it does mean
 * renaming a part slug won't be caught here, so the route and the data have to
 * move together.
 */
export function getChapterHref(chapter: ChapterMeta): Route {
  const part = partsById.get(chapter.part);
  return `/learn/${part?.slug ?? "unknown"}/${chapter.slug}` as Route;
}

export function getPartHref(part: PartMeta): Route {
  return `/learn/${part.slug}` as Route;
}
