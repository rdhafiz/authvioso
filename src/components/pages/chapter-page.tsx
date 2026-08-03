import { FileQuestion } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/json-ld";
import { ChapterLayout } from "@/components/learning/chapter-layout";
import type { Crumb } from "@/components/navigation/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import type { Locale } from "@/config/i18n";
import { localeHref } from "@/lib/content/locale-href";
import { getTableOfContents, loadChapterContent } from "@/lib/content/mdx";
import {
  getChapter,
  getChapterHref,
  getChapterNeighbours,
  getChapterPosition,
  getPart,
  getPartHref,
  getPrerequisites,
  getRelatedChapters,
} from "@/lib/content/queries";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/structured-data";

/**
 * The chapter page, once for both editions.
 *
 * `D-0015` puts Bangla in a parallel `/bn` route tree rather than behind a
 * `[locale]` segment, so English URLs stay at the root. That only works
 * without duplicating logic if the page itself lives here and each route file
 * is a two-line wrapper naming its locale — which is the whole point: there is
 * nothing in the route files for the two editions to drift apart on.
 */

export interface ChapterPageParams {
  partSlug: string;
  chapterSlug: string;
  locale: Locale;
}

export function buildChapterMetadata({
  partSlug,
  chapterSlug,
  locale,
}: ChapterPageParams): Metadata {
  const chapter = getChapter(chapterSlug);
  const part = getPart(partSlug);

  if (!chapter || !part) return { title: "Chapter not found" };

  return buildMetadata({
    title: chapter.title,
    description: `${part.title}. ${chapter.readingTime} minute read.`,
    path: localeHref(`/learn/${part.slug}/${chapter.slug}`, locale),
    type: "article",
  });
}

export async function ChapterPage({
  partSlug,
  chapterSlug,
  locale,
}: ChapterPageParams) {
  const chapter = getChapter(chapterSlug);
  const part = getPart(partSlug);

  // Unknown slug, or a chapter reached through the wrong part. Both are real
  // 404s rather than missing content.
  if (!chapter || !part || chapter.part !== part.id) notFound();

  const content = await loadChapterContent(chapter.slug, locale);
  const toc = await getTableOfContents(chapter.slug, locale);
  const { previous, next } = getChapterNeighbours(chapter.id);

  const crumbs: Crumb[] = [
    { label: "Curriculum", href: localeHref("/learn", locale) },
    { label: part.title, href: localeHref(getPartHref(part), locale) },
    { label: chapter.title },
  ];

  const path = localeHref(`/learn/${part.slug}/${chapter.slug}`, locale);
  const description = `${part.title}. ${chapter.readingTime} minute read.`;

  return (
    <>
      <ChapterLayout
        chapter={chapter}
        partTitle={part.title}
        partHref={localeHref(getPartHref(part), locale)}
        crumbs={crumbs}
        toc={toc}
        prerequisites={getPrerequisites(chapter.id)}
        related={getRelatedChapters(chapter.id)}
        position={getChapterPosition(chapter.id)}
        locale={locale}
        previous={
          previous
            ? {
                href: localeHref(getChapterHref(previous), locale),
                label: previous.title,
                meta: getPart(previous.part)?.title,
              }
            : null
        }
        next={
          next
            ? {
                href: localeHref(getChapterHref(next), locale),
                label: next.title,
                meta: getPart(next.part)?.title,
              }
            : null
        }
      >
        {content ? (
          <content.Content />
        ) : (
          /*
            Two different absences reach this branch, and they read the same to
            a visitor: a chapter nobody has written, and a chapter written in
            English but not yet translated. The second is the common case in
            the Bangla edition for most of v1.0, and `PRJ-004` §3.8 requires
            readers to be told plainly which material is available in which
            language rather than left to infer it.
          */
          <EmptyState
            icon={FileQuestion}
            title={
              locale === "en"
                ? "This chapter hasn't been written yet"
                : "This chapter is not available in Bangla yet"
            }
            description={
              locale === "en"
                ? "The curriculum structure is settled but the text isn't. Its place in the reading order, its prerequisites and what comes next are all shown here in the meantime."
                : "The Bangla edition covers the foundational modules. This chapter is available in English, and its place in the reading order is shown here."
            }
            action={
              <Link href={localeHref("/learn", locale) as Route}>
                Back to the curriculum
              </Link>
            }
          />
        )}
      </ChapterLayout>

      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={articleSchema({ title: chapter.title, description, path })}
      />
    </>
  );
}
