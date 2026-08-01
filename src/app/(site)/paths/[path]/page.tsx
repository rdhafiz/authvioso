// A single learning path (backend, frontend, mobile, and so on).
//
// Paths are just curated routes through the existing chapters — they never
// get their own content, and they never earn a separate certificate. Each one
// has to state what it skips and what that costs you.

export default async function PathPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  await params;
  return null;
}
