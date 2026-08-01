import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "What Authvioso is, who maintains it, and why it is independent.",
  path: "/about",
});

export default function AboutPage() {
  return null;
}
