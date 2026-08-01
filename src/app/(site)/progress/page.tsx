import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Your progress",
  description:
    "Chapters read and objectives met. Stored locally, no account required.",
  path: "/progress",
});

export default function ProgressPage() {
  return null;
}
