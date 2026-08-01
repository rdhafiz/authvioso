import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Changelog",
  description:
    "What changed, when, and what it affects, including corrections.",
  path: "/changelog",
});

export default function ChangelogPage() {
  return null;
}
