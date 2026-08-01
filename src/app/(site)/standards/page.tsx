import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Content standards",
  description:
    "The standards every chapter, diagram, example, and question follows.",
  path: "/standards",
});

export default function StandardsPage() {
  return null;
}
