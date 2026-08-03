import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/content/json-ld";
import type { Locale } from "@/config/i18n";
import { localeHref } from "@/lib/content/locale-href";
import {
  getAllChapters,
  getAllParts,
  getChaptersInPart,
  getPartReadingTime,
} from "@/lib/content/queries";
import { buildMetadata } from "@/lib/seo/metadata";
import { courseSchema } from "@/lib/seo/structured-data";

/**
 * The curriculum index, once for both editions.
 *
 * Same reasoning as `chapter-page.tsx` — `D-0015` gives Bangla a parallel
 * route tree, which only avoids duplication if the page body lives in one
 * place and the route files just name a locale.
 *
 * The structure shown here is the same in both editions because the
 * curriculum is the same; only the links change. Which chapters have Bangla
 * text is a per-chapter fact, stated on the chapter itself rather than
 * guessed at from an index (`PRJ-004` §3.8).
 */

export function buildLearnIndexMetadata(locale: Locale): Metadata {
  return buildMetadata({
    title: "Curriculum",
    description:
      "Nine parts and 57 chapters covering core authentication from first principles.",
    path: localeHref("/learn", locale),
  });
}

export function LearnIndexPage({ locale }: { locale: Locale }) {
  const parts = getAllParts();
  const totalMinutes = parts.reduce(
    (sum, part) => sum + getPartReadingTime(part.id),
    0,
  );

  return (
    <div className="container-prose max-w-none">
      <header className="mb-10">
        <h1 className="text-h1">Curriculum</h1>
        <p className="text-text-secondary text-body-sm mt-3 flex flex-wrap gap-x-4">
          <span>{parts.length} parts</span>
          <span>{getAllChapters().length} chapters</span>
          <span>~{Math.round(totalMinutes / 60)} hours reading</span>
        </p>
      </header>

      <ol className="flex flex-col gap-4">
        {parts.map((part, index) => {
          const chapters = getChaptersInPart(part.id);
          return (
            <li key={part.id}>
              <Link
                href={localeHref(`/learn/${part.slug}`, locale)}
                className="border-border-subtle hover:border-border-strong block rounded-md border p-5 no-underline"
              >
                <p className="text-text-secondary text-body-sm mb-1">
                  Part {index + 1} · {part.level}
                </p>
                <h2 className="text-text-primary text-h4">{part.title}</h2>
                <p className="text-text-secondary mt-2">{part.question}</p>
                <p className="text-text-secondary text-body-sm mt-3">
                  {chapters.length} chapters · {getPartReadingTime(part.id)} min
                </p>
              </Link>
            </li>
          );
        })}
      </ol>

      {/*
        Emitted for the English edition only. The schema describes one course,
        and two copies at two URLs describing the same 57 chapters is a
        duplicate claim rather than two courses.
      */}
      {locale === "en" && <JsonLd data={courseSchema()} />}
    </div>
  );
}
