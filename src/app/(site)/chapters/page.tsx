import type { Metadata, Route } from "next";
import Link from "next/link";

import {
  getAllParts,
  getChapterHref,
  getChaptersInPart,
} from "@/lib/content/queries";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Chapter index",
  description:
    "Every chapter, with its level, reading time, and prerequisites.",
  path: "/chapters",
});

/**
 * The flat list.
 *
 * /learn is the front door and shows parts; this is the reference view for
 * someone who already knows roughly what they want and would rather scan the
 * whole thing at once. Filtering and sorting arrive with the search work.
 */
export default function ChaptersPage() {
  return (
    <div className="container-page px-4 py-10">
      <header className="mb-10">
        <h1 className="text-2xl font-bold">Chapter index</h1>
        <p className="text-text-secondary mt-3">
          All 57 chapters in reading order.
        </p>
      </header>

      <div className="flex flex-col gap-10">
        {getAllParts().map((part) => (
          <section key={part.id}>
            <h2 className="border-border-subtle text-md mb-3 border-b pb-2 font-semibold">
              <Link
                href={`/learn/${part.slug}` as Route}
                className="no-underline"
              >
                {part.title}
              </Link>
            </h2>

            <table className="w-full text-sm">
              <thead className="sr-only">
                <tr>
                  <th scope="col">Chapter</th>
                  <th scope="col">Level</th>
                  <th scope="col">Reading time</th>
                </tr>
              </thead>
              <tbody>
                {getChaptersInPart(part.id).map((chapter) => (
                  <tr
                    key={chapter.id}
                    className="border-border-subtle border-b"
                  >
                    <td className="py-2 pr-4">
                      <Link href={getChapterHref(chapter) as Route}>
                        {chapter.title}
                      </Link>
                    </td>
                    <td className="text-text-muted w-32 py-2 capitalize">
                      {chapter.level}
                    </td>
                    <td className="text-text-muted w-20 py-2 text-right tabular-nums">
                      {chapter.readingTime} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </div>
  );
}
