import { FileQuestion } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/json-ld";
import { ChapterLayout } from "@/components/learning/chapter-layout";
import type { Crumb } from "@/components/navigation/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { getTableOfContents, loadChapterContent } from "@/lib/content/mdx";
import {
  getAllChapters,
  getChapter,
  getChapterHref,
  getChapterNeighbours,
  getChapterPosition,
  getPart,
  getPartHref,
  getPrerequisites,
  getRelatedChapters,
} from "@/lib/content/queries";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/metadata";

interface Props {
  params: Promise<{ part: string; chapter: string }>;
}

/**
 * Every chapter gets a prerendered route, written or not.
 *
 * Deliberately not gated on whether the MDX exists. An unwritten chapter
 * renders as "not written yet" with its prerequisites and neighbours intact —
 * a 404 would claim the chapter doesn't exist, which is a different and wrong
 * statement, and it would mean the sidebar links into dead ends for months.
 */
export function generateStaticParams() {
  return getAllChapters().map((chapter) => ({
    part: getPart(chapter.part)?.slug ?? "",
    chapter: chapter.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { part: partSlug, chapter: chapterSlug } = await params;
  const chapter = getChapter(chapterSlug);
  const part = getPart(partSlug);

  if (!chapter || !part) return { title: "Chapter not found" };

  return buildMetadata({
    title: chapter.title,
    description: `${part.title}. ${chapter.readingTime} minute read.`,
    path: `/learn/${part.slug}/${chapter.slug}`,
    type: "article",
  });
}

export default async function ChapterPage({ params }: Props) {
  const { part: partSlug, chapter: chapterSlug } = await params;

  const chapter = getChapter(chapterSlug);
  const part = getPart(partSlug);

  // Unknown slug, or a chapter reached through the wrong part. Both are real
  // 404s rather than missing content.
  if (!chapter || !part || chapter.part !== part.id) notFound();

  const content = await loadChapterContent(chapter.slug);
  const toc = await getTableOfContents(chapter.slug);
  const { previous, next } = getChapterNeighbours(chapter.id);

  const crumbs: Crumb[] = [
    { label: "Curriculum", href: "/learn" },
    { label: part.title, href: getPartHref(part) },
    { label: chapter.title },
  ];

  const description = `${part.title}. ${chapter.readingTime} minute read.`;

  return (
    <>
      <ChapterLayout
        chapter={chapter}
        partTitle={part.title}
        partHref={getPartHref(part)}
        crumbs={crumbs}
        toc={toc}
        prerequisites={getPrerequisites(chapter.id)}
        related={getRelatedChapters(chapter.id)}
        position={getChapterPosition(chapter.id)}
        previous={
          previous
            ? {
                href: getChapterHref(previous),
                label: previous.title,
                meta: getPart(previous.part)?.title,
              }
            : null
        }
        next={
          next
            ? {
                href: getChapterHref(next),
                label: next.title,
                meta: getPart(next.part)?.title,
              }
            : null
        }
      >
        {content ? (
          <content.Content />
        ) : (
          <EmptyState
            icon={FileQuestion}
            title="This chapter hasn't been written yet"
            description="The curriculum structure is settled but the text isn't. Its place in the reading order, its prerequisites and what comes next are all shown here in the meantime."
            action={
              <Link href={"/learn" as Route}>Back to the curriculum</Link>
            }
          />
        )}
      </ChapterLayout>

      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={articleSchema({
          title: chapter.title,
          description,
          path: `/learn/${part.slug}/${chapter.slug}`,
        })}
      />
    </>
  );
}
