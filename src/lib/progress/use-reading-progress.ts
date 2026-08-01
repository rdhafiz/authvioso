"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { ChapterId } from "@/types/content";

/**
 * Reading progress, stored locally.
 *
 * No account, nothing sent anywhere. The trade-off is that we can't tell you
 * how many people read a chapter or where they stop, and that's accepted —
 * the alternative is instrumenting people who came here to read.
 *
 * Marking a chapter read is an explicit action. Doing it on scroll would just
 * reward leaving a tab open, and it puts a claim in someone's record that
 * they never made.
 *
 * Written as an external store rather than component state because
 * localStorage *is* external state: it's shared across every component that
 * reads it and across tabs. useSyncExternalStore handles both, and the
 * storage event gives cross-tab sync for nothing.
 */

const STORAGE_KEY = "authvioso-progress";

interface ProgressState {
  version: 1;
  read: ChapterId[];
}

// Stable reference. Returning a fresh object from getSnapshot would re-render
// forever, and this is also what the server sees.
const EMPTY: ProgressState = { version: 1, read: [] };

const listeners = new Set<() => void>();
let cache: ProgressState | null = null;

function read(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as ProgressState;
    // Half-written value, someone else's data, or a schema we don't know.
    // Fall back rather than throwing on every render.
    if (parsed?.version !== 1 || !Array.isArray(parsed.read)) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

function write(next: ProgressState) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode, or quota. Losing progress is survivable; crashing the
    // page over it isn't.
  }
  for (const listener of listeners) listener();
}

function getSnapshot(): ProgressState {
  cache ??= read();
  return cache;
}

function getServerSnapshot(): ProgressState {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // Another tab changed it.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = read();
    for (const l of listeners) l();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useReadingProgress() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isRead = useCallback(
    (id: ChapterId) => state.read.includes(id),
    [state.read],
  );

  const toggle = useCallback((id: ChapterId) => {
    const current = getSnapshot();
    write({
      ...current,
      read: current.read.includes(id)
        ? current.read.filter((entry) => entry !== id)
        : [...current.read, id],
    });
  }, []);

  /** Wipes everything. One action, no confirmation theatre. */
  const clear = useCallback(() => {
    cache = EMPTY;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing useful to do about it.
    }
    for (const listener of listeners) listener();
  }, []);

  /** The account-free way to move between devices. */
  const exportProgress = useCallback(
    () => JSON.stringify(state, null, 2),
    [state],
  );

  return {
    readCount: state.read.length,
    isRead,
    toggle,
    clear,
    exportProgress,
  };
}
