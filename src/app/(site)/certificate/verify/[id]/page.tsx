import type { Metadata } from "next";

// Public certificate verification. Anyone with the ID can hit this, no login.
//
// Be careful with what this page returns. It shows four things and nothing
// else: the holder's name, which curriculum version they completed, the issue
// date, and whether the signature checks out. Not their score, not how many
// attempts it took, not their email, not which language edition they read.
// Someone handed us their name on the understanding it would be used for a
// certificate — leaking anything past that is a betrayal of that.
//
// An unknown ID returns "not found" and nothing more. Don't hint that it was
// close to a real one, and don't confirm whether it ever existed.

// This page has a person's name on it, so it must never be indexed.
export const metadata: Metadata = {
  title: "Verify a certificate",
  robots: { index: false, follow: false },
};

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return null;
}
