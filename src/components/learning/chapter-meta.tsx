import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/config/i18n";
import type { ChapterMeta } from "@/lib/content/curriculum";
import { localeHref } from "@/lib/content/locale-href";
import { getChapterHref } from "@/lib/content/queries";

/**
 * What the reader will be able to do afterwards.
 *
 * Phrased as actions, not topics. "Understand cookie attributes" is a subject
 * heading; "choose a correct attribute set for a given case" is something a
 * reader can check themselves against, which is the point.
 *
 * Three to six. Past that nobody reads them and they stop functioning as a
 * contract.
 */
export function LearningObjectives({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="objectives"
      className="border-border-subtle mb-10 rounded-md border p-4"
    >
      <h2 id="objectives" className="mb-3 text-sm font-semibold">
        After this chapter you can
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm">
            <ArrowRight
              className="text-text-secondary mt-0.5 size-4 shrink-0"
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Direct prerequisites.
 *
 * Only the immediate ones. The full chain is reachable one hop further on,
 * and rendering twenty entries produces a wall that gets skipped — which
 * defeats the purpose, because the two that mattered are in there somewhere.
 */
export function Prerequisites({
  items,
  locale,
}: {
  items: ChapterMeta[];
  locale: Locale;
}) {
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="prerequisites"
      className="border-border-subtle mb-10 rounded-md border p-4"
    >
      <h2 id="prerequisites" className="mb-2 text-sm font-semibold">
        Before this chapter
      </h2>
      <ul className="flex flex-col gap-1 text-sm">
        {items.map((chapter) => (
          <li key={chapter.id}>
            <Link href={localeHref(getChapterHref(chapter), locale)}>
              {chapter.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Related chapters.
 *
 * Currently derived from the dependency graph — prerequisites, dependants,
 * part siblings. Once the knowledge graph carries `contrasts-with` and
 * `threatens` edges this should read those instead, because the genuinely
 * useful relationships are the non-hierarchical ones: what this competes
 * with, what attacks it, what defends it.
 */
export function RelatedTopics({
  items,
  locale,
}: {
  items: ChapterMeta[];
  locale: Locale;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="related" className="mt-12">
      <h2 id="related" className="text-md mb-4 font-semibold">
        Related
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((chapter) => (
          <li key={chapter.id}>
            <Link
              href={localeHref(getChapterHref(chapter), locale)}
              className="border-border-subtle hover:border-border-strong block rounded-md border p-3 text-sm no-underline"
            >
              <span className="text-text-primary font-medium">
                {chapter.title}
              </span>
              <span className="text-text-secondary mt-1 block capitalize">
                {chapter.level} · {chapter.readingTime} min
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
