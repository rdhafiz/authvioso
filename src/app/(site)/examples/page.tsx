import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Examples",
  description:
    "Runnable authentication examples, each demonstrating one concept.",
  path: "/examples",
});

export default function ExamplesPage() {
  return null;
}
