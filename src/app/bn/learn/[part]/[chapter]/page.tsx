import type { Metadata } from "next";

import {
  buildChapterMetadata,
  ChapterPage,
} from "@/components/pages/chapter-page";
import { getAllChapters, getPart } from "@/lib/content/queries";

/**
 * The Bangla chapter route.
 *
 * Identical to its English counterpart apart from the locale. That is the
 * design (`D-0015`, `ADR-0011`): the page lives in one place, so the two
 * editions have nothing to drift apart on.
 *
 * Every chapter prerenders here too, including ones with no Bangla text.
 * `PRJ-004` §3.8 translates the foundational modules for v1.0, not the whole
 * curriculum, so "available in English, not yet in Bangla" is the expected
 * state for most of this tree and is stated on the page rather than 404'd.
 */

interface Props {
  params: Promise<{ part: string; chapter: string }>;
}

export function generateStaticParams() {
  return getAllChapters().map((chapter) => ({
    part: getPart(chapter.part)?.slug ?? "",
    chapter: chapter.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { part, chapter } = await params;
  return buildChapterMetadata({
    partSlug: part,
    chapterSlug: chapter,
    locale: "bn",
  });
}

export default async function Page({ params }: Props) {
  const { part, chapter } = await params;
  return <ChapterPage partSlug={part} chapterSlug={chapter} locale="bn" />;
}
