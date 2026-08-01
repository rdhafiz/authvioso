// The chapter page. This is the one that matters — everything else on the
// site exists to get people here.
//
// When it's built it renders the full chapter template in a fixed order:
// metadata, prerequisites, definitions, explanation, diagram, examples,
// security notes, best practices, common mistakes, summary, check-yourself,
// further reading. The order is fixed so readers can jump straight to
// "common mistakes" on their fourth chapter without hunting for it.

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ part: string; chapter: string }>;
}) {
  await params;
  return null;
}
