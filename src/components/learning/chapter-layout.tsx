import type { ReactNode } from "react";
import type { Route } from "next";

import { ChapterHeader } from "./chapter-header";
import {
  LearningObjectives,
  Prerequisites,
  RelatedTopics,
} from "./chapter-meta";
import { ReadingProgressBar } from "./reading-progress-bar";
import { Breadcrumbs, type Crumb } from "@/components/navigation/breadcrumbs";
import { TableOfContents } from "@/components/navigation/table-of-contents";
import { Pagination, type PaginationLink } from "@/components/ui/pagination";
import type { ChapterMeta } from "@/lib/content/curriculum";
import type { TocEntry } from "@/lib/content/mdx";
import type { ChapterId, Level } from "@/types/content";

/**
 * The frame every chapter renders inside.
 *
 * Pulled out of the route so the ordering is defined once. Section order is
 * fixed and isn't a per-chapter decision — the payoff is that by their fourth
 * chapter a reader knows prerequisites are above the text and related links
 * are at the bottom, and can skip straight there without looking.
 *
 * Takes content as `children` rather than knowing about MDX, so the preview
 * route and the real chapter route share exactly this layout.
 */
export function ChapterLayout({
  chapter,
  partTitle,
  partHref,
  crumbs,
  toc,
  objectives,
  prerequisites,
  related,
  previous,
  next,
  position,
  tags,
  children,
}: {
  chapter: {
    id: ChapterId;
    title: string;
    level: Level;
    readingTime: number;
  };
  partTitle: string;
  partHref: Route;
  crumbs: Crumb[];
  toc: TocEntry[];
  objectives?: string[];
  prerequisites: ChapterMeta[];
  related: ChapterMeta[];
  previous?: PaginationLink | null;
  next?: PaginationLink | null;
  position: { index: number; total: number };
  tags?: string[];
  children: ReactNode;
}) {
  return (
    <>
      <ReadingProgressBar />

      <div className="flex gap-12">
        <article className="min-w-0 flex-1">
          <Breadcrumbs items={crumbs} />

          <ChapterHeader
            id={chapter.id}
            title={chapter.title}
            partTitle={partTitle}
            partHref={partHref}
            level={chapter.level}
            readingTime={chapter.readingTime}
            position={position}
            tags={tags}
          />

          {objectives ? <LearningObjectives items={objectives} /> : null}
          <Prerequisites items={prerequisites} />

          {/* The chapter body. Everything above and below is chrome. */}
          <div className="container-prose max-w-none">{children}</div>

          <RelatedTopics items={related} />
          <Pagination previous={previous} next={next} />
        </article>

        {/* Only rendered where there's room for it and something to show —
            a two-item contents list is noise. */}
        {toc.length > 1 ? (
          <aside className="hidden w-[240px] shrink-0 xl:block">
            <div className="sticky top-10 max-h-[calc(100dvh-5rem)] overflow-y-auto">
              <TableOfContents items={toc} />
            </div>
          </aside>
        ) : null}
      </div>
    </>
  );
}
