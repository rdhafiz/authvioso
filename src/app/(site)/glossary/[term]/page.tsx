// One glossary term.
//
// The glossary defines the word; the chapter teaches the idea. Keep the
// definition here short and link out — if this page starts explaining things
// it'll drift from the chapter and readers won't know which one is current.

export default async function TermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  await params;
  return null;
}
