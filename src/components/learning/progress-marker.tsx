"use client";

import { Check, Circle } from "lucide-react";

import { useReadingProgress } from "@/lib/progress/use-reading-progress";
import type { ChapterId } from "@/types/content";
import { cn } from "@/lib/utils";

/**
 * Mark this chapter read.
 *
 * A button, deliberately. Inferring it from scroll position rewards leaving a
 * tab open and puts a claim in someone's record they never made — and the
 * record is the thing the certificate is eventually built on.
 *
 * Reversible in one click. No confirmation, no "are you sure".
 */
export function ProgressMarker({ chapterId }: { chapterId: ChapterId }) {
  const { isRead, toggle } = useReadingProgress();
  const read = isRead(chapterId);

  return (
    <button
      type="button"
      onClick={() => toggle(chapterId)}
      aria-pressed={read}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
        read
          ? "border-status-success/40 bg-status-success-surface text-status-success"
          : "border-border-subtle text-text-secondary hover:border-border-strong",
      )}
    >
      {read ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Circle className="size-4" aria-hidden />
      )}
      {read ? "Read" : "Mark as read"}
    </button>
  );
}
