import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Settings",
  description: "Theme, language, and your locally stored progress.",
  path: "/settings",
  noIndex: true,
});

export default function SettingsPage() {
  return null;
}
