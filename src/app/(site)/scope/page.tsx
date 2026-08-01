import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Scope",
  description: "What this release covers, and what it deliberately excludes.",
  path: "/scope",
});

export default function ScopePage() {
  return null;
}
