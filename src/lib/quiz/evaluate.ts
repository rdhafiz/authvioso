import type {
  Answer,
  AttemptResult,
  Question,
  QuestionResult,
} from "@/types/quiz";

/**
 * Marking.
 *
 * Pure functions, no React, no storage. Everything here can be reasoned about
 * and tested without rendering anything, which matters because this is the
 * part that must not be wrong — a marking bug tells a reader they don't
 * understand something they do.
 *
 * Nothing here produces a score or a percentage. `QZ-006` reports results as
 * objectives met and unmet, and the shape of this module follows from that:
 * the output is two lists of objectives, not a number.
 */

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((value, index) => value === right[index]);
}

function sameOrder(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

function asList(answer: Answer): string[] {
  return Array.isArray(answer) ? answer : [];
}

function asMap(answer: Answer): Record<string, string> {
  return answer && !Array.isArray(answer) ? answer : {};
}

/**
 * Marks one question.
 *
 * Partially-correct answers are wrong. There is no partial credit anywhere in
 * the system (`QZ-004` §1) — a reader who picks three of four required
 * defences has an incomplete model, and scoring that at 75% invites them to
 * treat the gap as rounding.
 *
 * Questions with parts still report per-part outcomes, because *which* half
 * they got wrong is the useful thing to tell them. It just doesn't change
 * whether the question was right.
 */
export function markQuestion(
  question: Question,
  answer: Answer,
): QuestionResult {
  switch (question.type) {
    case "single-choice": {
      const [chosen] = asList(answer);
      return { questionId: question.id, correct: chosen === question.correct };
    }

    case "multiple-choice": {
      return {
        questionId: question.id,
        correct: sameSet(asList(answer), question.correct),
      };
    }

    case "paired-claim": {
      // Two parts: the verdict on the claim, and the reason for it. Both are
      // required, because the verdict alone is a coin toss.
      const given = asMap(answer);
      const verdictCorrect = given.verdict === String(question.claimIsTrue);
      const reasonCorrect =
        given.justification === question.correctJustification;

      return {
        questionId: question.id,
        correct: verdictCorrect && reasonCorrect,
        parts: [
          { label: "Claim", correct: verdictCorrect },
          { label: "Reason", correct: reasonCorrect },
        ],
      };
    }

    case "sequence": {
      return {
        questionId: question.id,
        correct: sameOrder(asList(answer), question.correctOrder),
      };
    }

    case "matching": {
      const given = asMap(answer);
      const expected = question.correctPairs;
      const keys = Object.keys(expected);
      return {
        questionId: question.id,
        correct:
          keys.length === Object.keys(given).length &&
          keys.every((key) => given[key] === expected[key]),
      };
    }

    case "scenario": {
      const given = asMap(answer);
      const parts = question.parts.map((part) => ({
        label: part.label,
        correct: given[part.id] === part.correct,
      }));

      return {
        questionId: question.id,
        correct: parts.every((part) => part.correct),
        parts,
      };
    }
  }
}

/**
 * Marks a whole attempt and reduces it to objectives.
 *
 * An objective counts as met only if every question testing it was right. One
 * question right and another wrong on the same objective means the reader's
 * model holds in one case and not another, which is exactly the state the
 * objective is meant to detect.
 */
export function markAttempt(
  questions: readonly Question[],
  answers: Readonly<Record<string, Answer>>,
): AttemptResult {
  const results = questions.map((question) =>
    markQuestion(question, answers[question.id]),
  );

  const byObjective = new Map<string, boolean>();
  for (const [index, question] of questions.entries()) {
    const correct = results[index]?.correct ?? false;
    const previous = byObjective.get(question.objective);
    byObjective.set(
      question.objective,
      previous === undefined ? correct : previous && correct,
    );
  }

  const met: string[] = [];
  const unmet: string[] = [];
  for (const [objective, achieved] of byObjective) {
    (achieved ? met : unmet).push(objective);
  }

  return { results, met, unmet };
}

/**
 * Is every question answered?
 *
 * Submit stays available regardless — nothing here blocks it. This drives a
 * plain statement of how many are unanswered, so a reader submitting an
 * incomplete attempt is doing it knowingly rather than by accident. Disabling
 * submit until every question is answered turns an assessment into a form
 * that argues with you.
 */
export function unansweredCount(
  questions: readonly Question[],
  answers: Readonly<Record<string, Answer>>,
): number {
  return questions.filter((question) => {
    const answer = answers[question.id];
    if (answer === undefined) return true;

    if (Array.isArray(answer)) {
      if (answer.length === 0) return true;
      // A sequence is only answered once every step has been placed.
      if (question.type === "sequence") {
        return answer.length !== question.steps.length;
      }
      return false;
    }

    const given = Object.keys(answer).length;
    if (question.type === "matching") {
      return given !== Object.keys(question.correctPairs).length;
    }
    if (question.type === "scenario") return given !== question.parts.length;
    if (question.type === "paired-claim") return given !== 2;
    return given === 0;
  }).length;
}
