import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "FAQ",
  description:
    "Common questions about the project, its scope, and its certificate.",
  path: "/faq",
});

export default function FaqPage() {
  return null;
}
