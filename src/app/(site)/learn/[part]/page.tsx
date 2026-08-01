// Part landing page (P1–P9). Waiting on content.
// generateStaticParams + generateMetadata go in once the parts are defined —
// no point guessing canonical URLs before the slugs exist.

export default async function PartPage({
  params,
}: {
  params: Promise<{ part: string }>;
}) {
  await params;
  return null;
}
