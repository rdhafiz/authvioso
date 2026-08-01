import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Core principles",
  description: "The principles that govern every decision in the project.",
  path: "/principles",
});

export default function PrinciplesPage() {
  return null;
}
