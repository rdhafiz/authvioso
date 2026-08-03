import type { Metadata } from "next";

import SampleChapter from "@/content/en/pages/sample-chapter.mdx";
import { ChapterLayout } from "@/components/learning/chapter-layout";
import { getPageTableOfContents } from "@/lib/content/mdx";
import { getChapter, getChapterHref } from "@/lib/content/queries";

/**
 * Component preview.
 *
 * Renders the sample chapter through the same ChapterLayout the real chapter
 * route uses, so this genuinely exercises the pipeline rather than
 * approximating it. If something renders here it renders in a chapter.
 *
 * Lives outside the curriculum on purpose — the sample isn't a chapter and
 * shouldn't appear in the sidebar, the index, prev/next or the sitemap.
 *
 * Delete this route and content/en/pages/sample-chapter.mdx once there are
 * real chapters to look at.
 */
export const metadata: Metadata = {
  title: "Component preview",
  robots: { index: false, follow: false },
};

export default async function ChapterPreviewPage() {
  const toc = await getPageTableOfContents("sample-chapter");

  // Borrowed from the real curriculum so the surrounding chrome — breadcrumbs,
  // prerequisites, prev/next — has something true to render rather than
  // invented placeholders.
  const prerequisites = [getChapter("C01"), getChapter("C05")].filter(
    (chapter) => chapter !== undefined,
  );
  const related = [getChapter("C13"), getChapter("C16")].filter(
    (chapter) => chapter !== undefined,
  );
  const next = getChapter("C02");

  return (
    <ChapterLayout
      locale="en"
      chapter={{
        id: "C00",
        title: "The Lifecycle of a Library Loan",
        level: "beginner",
        readingTime: 12,
      }}
      partTitle="Component preview"
      partHref="/learn"
      crumbs={[
        { label: "Curriculum", href: "/learn" },
        { label: "Component preview" },
      ]}
      toc={toc}
      objectives={[
        "identify which component owns each fact in a small system",
        "explain why a loan period belongs to the loan and not the copy",
        "choose renewal rules that keep reservations meaningful",
      ]}
      prerequisites={prerequisites}
      related={related}
      position={{ index: 0, total: 57 }}
      tags={["sample", "not-real-content"]}
      next={
        next
          ? {
              href: getChapterHref(next),
              label: next.title,
              meta: "Foundations",
            }
          : null
      }
    >
      <SampleChapter />
    </ChapterLayout>
  );
}
