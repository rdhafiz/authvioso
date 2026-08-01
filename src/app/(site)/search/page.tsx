import { SearchIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search the curriculum, the glossary, and the examples.",
  path: "/search",
  noIndex: true,
});

/**
 * Search lives at a real URL rather than only in a dialog, so results are
 * linkable and the whole thing still works without JavaScript. The dialog,
 * when it arrives, is an enhancement on top of this page.
 */
export default function SearchPage() {
  return (
    <div className="container-prose px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Search</h1>

      <EmptyState
        icon={SearchIcon}
        title="Search isn't built yet"
        description="The index is generated from the chapters and the knowledge graph, so it needs content to exist first. Until then, the curriculum and the chapter index are the way in."
        action={
          <span className="flex gap-4">
            <Link href="/learn">Browse the curriculum</Link>
            <Link href="/chapters">Chapter index</Link>
          </span>
        }
      />
    </div>
  );
}
