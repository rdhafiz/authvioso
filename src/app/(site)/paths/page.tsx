import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Learning paths",
  description: "Curated routes through the curriculum for a specific role.",
  path: "/paths",
});

export default function PathsPage() {
  return null;
}
