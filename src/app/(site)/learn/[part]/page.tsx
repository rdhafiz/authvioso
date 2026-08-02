import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/json-ld";
import { Breadcrumbs, type Crumb } from "@/components/navigation/breadcrumbs";
import {
  getAllParts,
  getChapterHref,
  getChaptersInPart,
  getPart,
  getPartReadingTime,
} from "@/lib/content/queries";
import { breadcrumbSchema } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/metadata";

interface Props {
  params: Promise<{ part: string }>;
}

export function generateStaticParams() {
  return getAllParts().map((part) => ({ part: part.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { part: slug } = await params;
  const part = getPart(slug);
  if (!part) return { title: "Part not found" };

  return buildMetadata({
    title: part.title,
    description: part.question,
    path: `/learn/${part.slug}`,
  });
}

export default async function PartPage({ params }: Props) {
  const { part: slug } = await params;
  const part = getPart(slug);
  if (!part) notFound();

  const chapters = getChaptersInPart(part.id);
  const minutes = getPartReadingTime(part.id);

  const crumbs: Crumb[] = [
    { label: "Curriculum", href: "/learn" },
    { label: part.title },
  ];

  return (
    <div className="container-prose max-w-none">
      <Breadcrumbs items={crumbs} />

      <header className="mb-10">
        <h1 className="text-2xl font-bold">{part.title}</h1>
        {/* The question is the point of the part. It goes above the chapter
            list, not below it. */}
        <p className="text-text-secondary text-md mt-3">{part.question}</p>
        <p className="text-text-secondary mt-3 flex flex-wrap gap-x-4 text-sm">
          <span>{part.level}</span>
          <span>{chapters.length} chapters</span>
          <span>~{Math.round(minutes / 60)} hours reading</span>
        </p>
      </header>

      <ol className="flex flex-col gap-1">
        {chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <Link
              href={getChapterHref(chapter) as Route}
              className="border-border-subtle hover:bg-surface-sunken flex items-baseline gap-4 rounded-md border-b px-2 py-3 no-underline"
            >
              <span className="text-text-secondary w-6 shrink-0 text-sm tabular-nums">
                {index + 1}
              </span>
              <span className="text-text-primary flex-1 font-medium">
                {chapter.title}
              </span>
              <span className="text-text-secondary shrink-0 text-sm">
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
