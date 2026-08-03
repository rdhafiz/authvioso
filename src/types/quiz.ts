import type { ChapterId, Level, NodeId } from "@/types/content";

/**
 * Question shapes.
 *
 * Six types, and the set is closed. `QZ-003` §0 permits exactly these; adding
 * a seventh is a specification change, not a component change, which is why
 * this is a discriminated union rather than anything extensible.
 *
 * Every type carries `node` and `objective`. A question that maps to no
 * concept cannot explain a wrong answer, and explaining wrong answers is most
 * of what the assessment is for (`QZ-003` §0).
 */

export interface QuestionBase {
  id: string;
  /** The one concept this tests. Wrong answers link here, not to the chapter. */
  node: NodeId;
  /** The one learning objective it serves. */
  objective: string;
  chapter: ChapterId;
  level: Level;
  /** Shown after submission, always. Never before. */
  explanation: string;
}

export interface Option {
  id: string;
  text: string;
  /**
   * Why this option is wrong, shown after submission.
   *
   * Optional, but the authoring guide asks for one on every distractor: an
   * option is only worth including if someone with an incomplete model would
   * pick it, and if that's true then it's worth saying why they shouldn't.
   */
  whyNot?: string;
}

/** One correct answer among four. The default format at every level. */
export interface SingleChoiceQuestion extends QuestionBase {
  type: "single-choice";
  prompt: string;
  options: Option[];
  correct: string;
}

/**
 * Several correct among five or six.
 *
 * The count is never stated — `QZ-003` §2. Telling the reader how many to pick
 * turns a question about completeness into arithmetic.
 */
export interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple-choice";
  prompt: string;
  options: Option[];
  correct: string[];
}

/**
 * A claim, and the reason it holds or fails.
 *
 * Plain true/false is not permitted. Guessing gets you half of them, and the
 * half you guessed look identical to the half you knew.
 */
export interface PairedClaimQuestion extends QuestionBase {
  type: "paired-claim";
  claim: string;
  claimIsTrue: boolean;
  /** Justifications for the verdict. Marked separately from the verdict. */
  justifications: Option[];
  correctJustification: string;
}

/** Put the steps in order. The natural format for flows. */
export interface SequenceQuestion extends QuestionBase {
  type: "sequence";
  prompt: string;
  /** Presented shuffled; this is the correct order. */
  steps: { id: string; text: string }[];
  correctOrder: string[];
}

/** Pair items across two sets — mechanisms to threats, defences to attacks. */
export interface MatchingQuestion extends QuestionBase {
  type: "matching";
  prompt: string;
  left: { id: string; text: string }[];
  right: { id: string; text: string }[];
  /** left id to right id. */
  correctPairs: Record<string, string>;
}

/**
 * A situation, a decision, and a reason — marked separately.
 *
 * Carries Advanced and Expert assessment. Every option is defensible, so this
 * tests judgment rather than error-spotting.
 */
export interface ScenarioQuestion extends QuestionBase {
  type: "scenario";
  situation: string;
  prompt: string;
  /** Usually "Risk" and "Action". Each marked on its own. */
  parts: {
    id: string;
    label: string;
    options: Option[];
    correct: string;
  }[];
}

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | PairedClaimQuestion
  | SequenceQuestion
  | MatchingQuestion
  | ScenarioQuestion;

export type QuestionType = Question["type"];

/**
 * A reader's answer, before marking.
 *
 * One shape for every question type. `string[]` covers a single choice (one
 * entry), a multi-select, and a sequence (ordered); `Record` covers matching
 * and the parts of a scenario. Keeping it uniform means the answer store,
 * the change handler and the "have they answered everything" check don't each
 * need six branches.
 */
export type Answer = string[] | Record<string, string> | undefined;

export interface QuestionResult {
  questionId: string;
  correct: boolean;
  /**
   * For questions marked in parts — scenario, paired claim — which parts were
   * right. `QZ-004` marks these separately because getting the risk right and
   * the action wrong is a different state of understanding from getting both
   * wrong, and collapsing them loses that.
   */
  parts?: { label: string; correct: boolean }[];
}

export interface AttemptResult {
  results: QuestionResult[];
  /**
   * Objectives the reader demonstrated, and those they did not.
   *
   * This is what results are reported as — `QZ-006` is explicit that a
   * percentage in a large font tells a reader nothing they can act on, and
   * "you haven't got these three concepts yet" tells them where to go.
   */
  met: string[];
  unmet: string[];
}

/** A quiz as a chapter declares it. */
export interface Quiz {
  id: string;
  chapter: ChapterId;
  title?: string;
  questions: Question[];
}
