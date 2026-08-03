import type { ChapterId } from "@/types/content";

/**
 * What the project holds about a reader, and nothing else.
 *
 * This shape is `WEB-009` §4's "Stored" column, one field per row. The
 * matching "Not stored" column is the more important half and it is enforced
 * here by absence: there is no field for time spent, scroll depth, when
 * someone studied, which pages they visited without marking, or anything
 * comparative between readers. Adding one is an amendment to `WEB-009`, not a
 * refactor.
 *
 * There are no bookmarks either. `D-0016` records why: bookmarks appear
 * nowhere in the specification, and the browser's own are the account-free
 * equivalent that already works.
 *
 * Everything lives in the reader's browser. No account, no server record, no
 * identifier (`TEC-4`, `SC-V5`).
 */

/** Bump when a field changes meaning. `migrate` below has to handle it. */
export const PROGRESS_VERSION = 2;

export interface AttemptRecord {
  /** Which assessment. A chapter check, a section assessment, or the final. */
  quizId: string;
  chapter: ChapterId;
  /** ISO date. The day, not the moment — the hour is not our business. */
  date: string;
  /** Objectives demonstrated, and those not. Never a score (`QZ-006`). */
  met: string[];
  unmet: string[];
}

export interface ProgressState {
  version: number;

  /** Chapters the reader explicitly marked read. Never inferred from scroll. */
  read: ChapterId[];

  /**
   * Objectives demonstrated across every attempt, unioned.
   *
   * Kept separately from `attempts` because this is the question the site
   * actually asks — "has this reader shown they can do X" — and deriving it
   * from the attempt log on every render means every consumer re-implements
   * the union rule and one of them gets it wrong.
   */
  objectivesMet: string[];

  attempts: AttemptRecord[];

  /**
   * Where the reader was, so "continue" goes somewhere useful.
   *
   * The chapter, not a scroll offset. An offset would be a measurement of
   * reading behaviour, which is in the "Not stored" column.
   */
  lastChapter?: ChapterId;

  /**
   * The curriculum version this progress belongs to.
   *
   * Without it, progress recorded against a curriculum that has since been
   * restructured silently claims the reader covered material that no longer
   * exists in that form (`RDM-003`).
   */
  curriculumVersion: string;
}

export const EMPTY_PROGRESS: ProgressState = {
  version: PROGRESS_VERSION,
  read: [],
  objectivesMet: [],
  attempts: [],
  curriculumVersion: "1.0",
};

/**
 * Brings a stored value up to the current shape.
 *
 * Returns `null` for anything it cannot make sense of, which the caller reads
 * as "start empty". Being permissive here matters: this parses data written by
 * an older build of the site, and throwing would mean a reader who has been
 * away for six months loses everything on their first visit back.
 *
 * Version 1 held only `read`. Everything else starts empty, which is the
 * truthful reading — the reader demonstrated no objectives under a schema
 * that could not record them.
 */
export function migrate(input: unknown): ProgressState | null {
  if (typeof input !== "object" || input === null) return null;
  const value = input as Partial<ProgressState>;

  if (!Array.isArray(value.read)) return null;

  if (value.version === 1) {
    return { ...EMPTY_PROGRESS, read: value.read };
  }

  if (value.version === PROGRESS_VERSION) {
    return {
      ...EMPTY_PROGRESS,
      ...value,
      read: value.read,
      objectivesMet: Array.isArray(value.objectivesMet)
        ? value.objectivesMet
        : [],
      attempts: Array.isArray(value.attempts) ? value.attempts : [],
    };
  }

  // A version from the future — the reader has used a newer build elsewhere.
  // Discarding is wrong and guessing is worse, so keep what is
  // unambiguous and let the rest rebuild.
  return { ...EMPTY_PROGRESS, read: value.read };
}

/** Objectives met, unioned across an attempt. Order-stable for diffing. */
export function withAttempt(
  state: ProgressState,
  attempt: AttemptRecord,
): ProgressState {
  const met = new Set(state.objectivesMet);
  for (const objective of attempt.met) met.add(objective);

  return {
    ...state,
    attempts: [...state.attempts, attempt],
    objectivesMet: [...met],
  };
}

/**
 * Everything the reader has, as a portable file.
 *
 * Export and import are the account-free route between devices, permanently
 * (`WEB-009` §4) — which is also why cross-device sync stays deferred
 * (`RDM-012`, `DF-02`). The full state is the export; there is no subset,
 * because a reader cannot verify what they have been given if it is filtered.
 */
export function serialise(state: ProgressState): string {
  return JSON.stringify(state, null, 2);
}

/** The other half. Returns `null` rather than throwing on a bad file. */
export function deserialise(raw: string): ProgressState | null {
  try {
    return migrate(JSON.parse(raw));
  } catch {
    return null;
  }
}
