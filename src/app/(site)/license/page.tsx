import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Licence",
  description: "The licence covering Authvioso content and code.",
  path: "/license",
});

export default function LicensePage() {
  return null;
}
