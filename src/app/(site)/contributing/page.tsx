import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contributing",
  description:
    "How to report an error, suggest a topic, translate, or contribute.",
  path: "/contributing",
});

export default function ContributingPage() {
  return null;
}
