"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  getAllParts,
  getChaptersInPart,
  getChapterHref,
} from "@/lib/content/queries";
import { editionHref, localeFromPathname } from "@/lib/content/edition";
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
 *
 * The edition is read off the pathname rather than passed in. This renders
 * inside both route trees (`D-0015`), and taking it from the URL means it
 * cannot disagree with the page the reader is actually on — which a prop
 * threaded through two layouts eventually would.
 */
export function CurriculumSidebar() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const prefix = locale === "bn" ? "/bn" : "";
  const to = (path: string) => editionHref(path, locale);

  return (
    <nav aria-label="Curriculum" className="text-sm">
      <ul className="flex flex-col gap-6">
        {getAllParts().map((part) => {
          const chapters = getChaptersInPart(part.id);
          const isCurrentPart = pathname.startsWith(
            `${prefix}/learn/${part.slug}`,
          );

          return (
            <li key={part.id}>
              <Link
                href={to(`/learn/${part.slug}`)}
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
                  const href = to(getChapterHref(chapter));
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
                            : "text-text-secondary hover:text-text-primary border-transparent",
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
