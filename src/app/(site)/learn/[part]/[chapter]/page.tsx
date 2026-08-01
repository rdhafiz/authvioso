import { FileQuestion } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";

import { JsonLd } from "@/components/content/json-ld";
import { Breadcrumbs, type Crumb } from "@/components/navigation/breadcrumbs";
import { TableOfContents } from "@/components/navigation/table-of-contents";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { getTableOfContents, loadChapterContent } from "@/lib/content/mdx";
import {
  getAllChapters,
  getChapter,
  getChapterHref,
  getChapterNeighbours,
  getChapterPosition,
  getPart,
  getPrerequisites,
} from "@/lib/content/queries";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/metadata";

interface Props {
  params: Promise<{ part: string; chapter: string }>;
}

/**
 * Every chapter in the curriculum gets a prerendered route, written or not.
 *
 * Deliberately not gated on whether the MDX exists. An unwritten chapter
 * renders as "not written yet" with its prerequisites and neighbours intact —
 * a 404 would claim the chapter doesn't exist, which is a different and wrong
 * statement. It also means the sidebar never links into a dead end.
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

  // Genuinely unknown slug, or a chapter reached through the wrong part.
  // Both are real 404s rather than missing content.
  if (!chapter || !part || chapter.part !== part.id) notFound();

  const content = await loadChapterContent(chapter.slug);
  const toc = await getTableOfContents(chapter.slug);
  const { previous, next } = getChapterNeighbours(chapter.id);
  const prerequisites = getPrerequisites(chapter.id);
  const position = getChapterPosition(chapter.id);

  const crumbs: Crumb[] = [
    { label: "Curriculum", href: "/learn" },
    { label: part.title, href: `/learn/${part.slug}` as Route },
    { label: chapter.title },
  ];

  return (
    <div className="flex gap-12">
      <article className="min-w-0 flex-1">
        <Breadcrumbs items={crumbs} />

        <header className="mb-8">
          <p className="text-text-muted mb-2 text-sm">
            {part.title} · Chapter {position.index} of {position.total}
          </p>
          <h1 className="text-2xl font-bold">{chapter.title}</h1>
          <p className="text-text-muted mt-3 flex flex-wrap gap-x-4 text-sm">
            <span className="capitalize">{chapter.level}</span>
            <span>{chapter.readingTime} min read</span>
          </p>
        </header>

        {/* Direct prerequisites only. The full chain is one hop further on and
            listing all of it produces a wall nobody reads. */}
        {prerequisites.length > 0 ? (
          <section className="border-border-subtle mb-10 rounded-md border p-4">
            <h2 className="mb-2 text-sm font-semibold">Before this chapter</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {prerequisites.map((prereq) => (
                <li key={prereq.id}>
                  <Link href={getChapterHref(prereq) as Route}>
                    {prereq.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {content ? (
          <div className="container-prose max-w-none">
            <content.Content />
          </div>
        ) : (
          <EmptyState
            icon={FileQuestion}
            title="This chapter hasn't been written yet"
            description="The curriculum structure is settled but the text isn't. Its place in the reading order, its prerequisites and what comes next are all shown here in the meantime."
            action={<Link href="/learn">Back to the curriculum</Link>}
          />
        )}

        <Pagination
          previous={
            previous
              ? {
                  href: getChapterHref(previous) as Route,
                  label: previous.title,
                  meta: getPart(previous.part)?.title,
                }
              : null
          }
          next={
            next
              ? {
                  href: getChapterHref(next) as Route,
                  label: next.title,
                  meta: getPart(next.part)?.title,
                }
              : null
          }
        />
      </article>

      {toc.length > 0 ? (
        <aside className="hidden w-[240px] shrink-0 xl:block">
          <div className="sticky top-10">
            <TableOfContents items={toc} />
          </div>
        </aside>
      ) : null}

      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={articleSchema({
          title: chapter.title,
          description: `${part.title}. ${chapter.readingTime} minute read.`,
          path: `/learn/${part.slug}/${chapter.slug}`,
        })}
      />
    </div>
  );
}
