import type { Metadata } from "next";

import {
  buildLearnIndexMetadata,
  LearnIndexPage,
} from "@/components/pages/learn-index-page";

export const metadata: Metadata = buildLearnIndexMetadata("bn");

export default function Page() {
  return <LearnIndexPage locale="bn" />;
}
