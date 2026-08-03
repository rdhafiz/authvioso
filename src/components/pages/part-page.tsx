import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/json-ld";
import { Breadcrumbs, type Crumb } from "@/components/navigation/breadcrumbs";
import type { Locale } from "@/config/i18n";
import { localeHref } from "@/lib/content/locale-href";
import {
  getChapterHref,
  getChaptersInPart,
  getPart,
  getPartReadingTime,
} from "@/lib/content/queries";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/structured-data";

/** One part's chapter list, once for both editions. See `D-0015`. */
export function buildPartMetadata(slug: string, locale: Locale): Metadata {
  const part = getPart(slug);
  if (!part) return { title: "Part not found" };

  return buildMetadata({
    title: part.title,
    description: part.question,
    path: localeHref(`/learn/${part.slug}`, locale),
  });
}

export function PartPage({ slug, locale }: { slug: string; locale: Locale }) {
  const part = getPart(slug);
  if (!part) notFound();

  const chapters = getChaptersInPart(part.id);
  const minutes = getPartReadingTime(part.id);

  const crumbs: Crumb[] = [
    { label: "Curriculum", href: localeHref("/learn", locale) },
    { label: part.title },
  ];

  return (
    <div className="container-prose max-w-none">
      <Breadcrumbs items={crumbs} />

      <header className="mb-10">
        <h1 className="text-h1">{part.title}</h1>
        {/* The question is the point of the part. It goes above the chapter
            list, not below it. */}
        <p className="text-text-secondary text-lead mt-3">{part.question}</p>
        <p className="text-text-secondary text-body-sm mt-3 flex flex-wrap gap-x-4">
          <span>{part.level}</span>
          <span>{chapters.length} chapters</span>
          <span>~{Math.round(minutes / 60)} hours reading</span>
        </p>
      </header>

      <ol className="flex flex-col gap-1">
        {chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <Link
              href={localeHref(getChapterHref(chapter), locale)}
              className="border-border-subtle hover:bg-surface-sunken flex items-baseline gap-4 rounded-md border-b px-2 py-3 no-underline"
            >
              <span className="text-text-secondary text-body-sm w-6 shrink-0 tabular-nums">
                {index + 1}
              </span>
              <span className="text-text-primary flex-1 font-medium">
                {chapter.title}
              </span>
              <span className="text-text-secondary text-body-sm shrink-0">
                {chapter.readingTime} min
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <JsonLd data={breadcrumbSchema(crumbs)} />
    </div>
  );
}
