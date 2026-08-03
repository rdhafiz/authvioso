"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { ChapterId } from "@/types/content";

import {
  EMPTY_PROGRESS,
  migrate,
  serialise,
  withAttempt,
  type AttemptRecord,
  type ProgressState,
} from "./state";

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
 *
 * The shape lives in state.ts, along with the reasoning about which fields
 * exist. This file is only the plumbing.
 */

const STORAGE_KEY = "authvioso-progress";

// Stable reference. Returning a fresh object from getSnapshot would re-render
// forever, and this is also what the server sees.
const EMPTY = EMPTY_PROGRESS;

const listeners = new Set<() => void>();
let cache: ProgressState | null = null;

function read(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    // Half-written value, someone else's data, or a schema we don't know.
    // migrate() salvages what it can and returns null when it can't.
    return migrate(JSON.parse(raw)) ?? EMPTY;
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

  /** Where "continue reading" should go. Set on chapter view, not on scroll. */
  const setLastChapter = useCallback((id: ChapterId) => {
    const current = getSnapshot();
    if (current.lastChapter === id) return;
    write({ ...current, lastChapter: id });
  }, []);

  /**
   * Records a completed attempt.
   *
   * Appends rather than replaces. `QZ-009` keeps every attempt because a
   * second attempt that goes better is the thing worth seeing, and overwriting
   * the first one deletes the evidence of it.
   */
  const recordAttempt = useCallback((attempt: AttemptRecord) => {
    write(withAttempt(getSnapshot(), attempt));
  }, []);

  const hasMet = useCallback(
    (objective: string) => state.objectivesMet.includes(objective),
    [state.objectivesMet],
  );

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
  const exportProgress = useCallback(() => serialise(state), [state]);

  /**
   * Restores from an exported file.
   *
   * Replaces rather than merges. Merging two histories requires deciding what
   * happens when they disagree, and every rule for that is a guess about which
   * device the reader considers authoritative. Replacing is predictable, and
   * the reader can export first if they want the other copy.
   *
   * Returns false on a file it cannot read, leaving existing progress intact.
   */
  const importProgress = useCallback((next: ProgressState | null) => {
    if (!next) return false;
    write(next);
    return true;
  }, []);

  return {
    state,
    readCount: state.read.length,
    isRead,
    toggle,
    setLastChapter,
    recordAttempt,
    hasMet,
    clear,
    exportProgress,
    importProgress,
  };
}
