import { Clock, Layers } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { ProgressMarker } from "./progress-marker";
import { Badge } from "@/components/ui/badge";
import type { ChapterId, Level } from "@/types/content";

/**
 * The block at the top of every chapter.
 *
 * Metadata is visible but quiet — a reader deciding whether to start needs
 * the level and the time, and then wants them out of the way. It sits above
 * the title in small muted text rather than in a boxed panel that competes
 * with the heading.
 */
export function ChapterHeader({
  id,
  title,
  partTitle,
  partHref,
  level,
  readingTime,
  position,
  tags,
}: {
  id: ChapterId;
  title: string;
  partTitle: string;
  partHref: Route;
  level: Level;
  readingTime: number;
  position: { index: number; total: number };
  tags?: string[];
}) {
  return (
    <header className="mb-8">
      <p className="text-text-secondary mb-2 text-sm">
        <Link href={partHref} className="no-underline">
          {partTitle}
        </Link>
        {/* Omitted for anything outside the curriculum — the preview route
            has no position, and "Chapter 0 of 57" is worse than nothing. */}
        {position.index > 0 ? (
          <>
            {" · "}
            Chapter {position.index} of {position.total}
          </>
        ) : null}
      </p>

      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <span className="text-text-secondary inline-flex items-center gap-1.5 text-sm">
          <Layers className="size-icon-xs" aria-hidden />
          <span className="capitalize">{level}</span>
        </span>

        <span className="text-text-secondary inline-flex items-center gap-1.5 text-sm">
          <Clock className="size-icon-xs" aria-hidden />
          {readingTime} min read
        </span>

        <ProgressMarker chapterId={id} />
      </div>

      {tags && tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary">{tag}</Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
