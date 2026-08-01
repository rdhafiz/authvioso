import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown while a chapter route resolves.
 *
 * Roughly the shape of a chapter header so the page doesn't jump when the
 * real thing arrives. Deliberately not a full skeleton of the article body —
 * fake paragraphs of grey bars imply we know how long the content is, and
 * they look worse than a bit of empty space for the fraction of a second this
 * is usually visible.
 */
export default function Loading() {
  return (
    <div className="container-prose max-w-none" aria-busy="true">
      <span className="sr-only">Loading</span>
      <Skeleton className="mb-6 h-4 w-64" />
      <Skeleton className="mb-3 h-9 w-3/4" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}
