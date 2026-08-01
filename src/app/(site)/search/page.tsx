import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search the curriculum, the glossary, and the examples.",
  path: "/search",
  noIndex: true,
});

export default function SearchPage() {
  return null;
}
