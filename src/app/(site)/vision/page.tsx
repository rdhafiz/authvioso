import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Project vision",
  description: "What Authvioso is and its long-term vision.",
  path: "/vision",
});

export default function VisionPage() {
  return null;
}
