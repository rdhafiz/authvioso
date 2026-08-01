import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Glossary",
  description:
    "Every term used in Authvioso, defined once and used identically everywhere.",
  path: "/glossary",
});

export default function GlossaryPage() {
  return null;
}
