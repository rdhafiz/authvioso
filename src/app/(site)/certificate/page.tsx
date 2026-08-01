import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Certificate",
  description:
    "What the certificate attests, what it does not claim, and what earning it requires.",
  path: "/certificate",
});

export default function CertificatePage() {
  return null;
}
