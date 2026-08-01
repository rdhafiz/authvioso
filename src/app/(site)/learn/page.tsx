import type { Metadata, Route } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/content/json-ld";
import {
  getAllChapters,
  getAllParts,
  getChaptersInPart,
  getPartReadingTime,
} from "@/lib/content/queries";
import { courseSchema } from "@/lib/seo/structured-data";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Curriculum",
  description:
    "Nine parts and 57 chapters covering core authentication from first principles.",
  path: "/learn",
});

export default function LearnPage() {
  const parts = getAllParts();
  const totalMinutes = parts.reduce(
    (sum, part) => sum + getPartReadingTime(part.id),
    0,
  );

  return (
    <div className="container-prose max-w-none">
      <header className="mb-10">
        <h1 className="text-2xl font-bold">Curriculum</h1>
        <p className="text-text-muted mt-3 flex flex-wrap gap-x-4 text-sm">
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
                href={`/learn/${part.slug}` as Route}
                className="border-border-subtle hover:border-border-strong block rounded-md border p-5 no-underline"
              >
                <p className="text-text-muted mb-1 text-sm">
                  Part {index + 1} · {part.level}
                </p>
                <h2 className="text-text-primary text-md font-semibold">
                  {part.title}
                </h2>
                <p className="text-text-secondary mt-2">{part.question}</p>
                <p className="text-text-muted mt-3 text-sm">
                  {chapters.length} chapters · {getPartReadingTime(part.id)} min
                </p>
              </Link>
            </li>
          );
        })}
      </ol>

      <JsonLd data={courseSchema()} />
    </div>
  );
}
