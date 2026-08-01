import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Chapter index",
  description:
    "Every chapter, with its level, reading time, and prerequisites.",
  path: "/chapters",
});

export default function ChaptersPage() {
  return null;
}
