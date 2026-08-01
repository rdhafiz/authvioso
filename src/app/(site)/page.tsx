import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Authvioso",
  description:
    "Authvioso teaches how authentication actually works, from first principles.",
  path: "/",
});

export default function HomePage() {
  return null;
}
