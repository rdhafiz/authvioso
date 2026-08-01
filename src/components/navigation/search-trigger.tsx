"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useHydrated } from "@/hooks/use-hydrated";

/**
 * Opens search.
 *
 * Navigates to /search for now. The dialog lands in a later sprint and this
 * stays the entry point either way — the page has to keep working on its own
 * so results are linkable and it survives without JavaScript.
 *
 * The shortcut is rendered rather than left as folklore. A keyboard shortcut
 * nobody can discover is a shortcut for whoever wrote it.
 */
export function SearchTrigger() {
  const router = useRouter();
  const hydrated = useHydrated();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        router.push("/search");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  // Guessing the platform from the user agent is unreliable, but the cost of
  // getting it wrong is showing the wrong modifier key in a hint. Default to
  // Ctrl and correct it once we're in a browser.
  const modifier =
    hydrated && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl";

  return (
    <button
      type="button"
      onClick={() => router.push("/search")}
      className="border-border-subtle text-text-muted hover:border-border-strong hover:text-text-primary inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition-colors"
    >
      <Search className="size-4" aria-hidden />
      <span>Search</span>
      <kbd className="border-border-subtle text-text-muted ml-2 hidden rounded border px-1.5 py-0.5 font-mono text-xs sm:inline">
        {modifier} K
      </kbd>
    </button>
  );
}
