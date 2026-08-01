"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  getAllParts,
  getChaptersInPart,
  getChapterHref,
} from "@/lib/content/queries";
import { cn } from "@/lib/utils";

/**
 * The curriculum tree.
 *
 * Every part is listed, always — collapsing everything except the current one
 * hides how much there is and makes jumping ahead awkward. The current part
 * is open, the rest are collapsed but one click away.
 *
 * Order is always the curriculum order. It doesn't reorder to match whatever
 * path someone picked; a map that rearranges itself isn't a map.
 */
export function CurriculumSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Curriculum" className="text-sm">
      <ul className="flex flex-col gap-6">
        {getAllParts().map((part) => {
          const chapters = getChaptersInPart(part.id);
          const isCurrentPart = pathname.startsWith(`/learn/${part.slug}`);

          return (
            <li key={part.id}>
              <Link
                href={`/learn/${part.slug}`}
                className={cn(
                  "mb-2 block font-semibold no-underline",
                  isCurrentPart ? "text-text-primary" : "text-text-secondary",
                )}
              >
                {part.title}
              </Link>

              <ul
                className={cn(
                  "border-border-subtle flex flex-col gap-1 border-l pl-3",
                  !isCurrentPart && "hidden lg:flex",
                )}
              >
                {chapters.map((chapter) => {
                  const href = getChapterHref(chapter);
                  const isCurrent = pathname === href;

                  return (
                    <li key={chapter.id}>
                      <Link
                        href={href}
                        aria-current={isCurrent ? "page" : undefined}
                        className={cn(
                          "-ml-3 block border-l-2 py-1 pl-3 no-underline transition-colors",
                          isCurrent
                            ? "border-text-link text-text-primary font-medium"
                            : "text-text-muted hover:text-text-primary border-transparent",
                        )}
                      >
                        {chapter.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
