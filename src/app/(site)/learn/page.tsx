import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Curriculum",
  description:
    "Nine parts and 57 chapters covering core authentication from first principles.",
  path: "/learn",
});

export default function LearnPage() {
  return null;
}
