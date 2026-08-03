"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { markAttempt, unansweredCount } from "@/lib/quiz/evaluate";
import type { Answer, Question } from "@/types/quiz";

import { QuestionCard } from "./question-card";
import { QuizResults } from "./quiz-results";

/**
 * A chapter check.
 *
 * The constraints here are unusual and most of them are things this component
 * deliberately does *not* do, so they are worth stating where someone editing
 * it will see them:
 *
 * - **No timer.** Anywhere. Timing measures how recently you read something,
 *   not whether you understand it.
 * - **Nothing auto-advances or auto-submits.** Answers stay changeable until
 *   submit, and submit is always a deliberate act.
 * - **Explanations appear after the whole attempt is submitted**, never per
 *   question. Per-question feedback steers people through the rest of the
 *   attempt and turns the second half into a different assessment from the
 *   first.
 * - **No score.** Results are what you've got and haven't got, by objective.
 * - **No streak, no pace indicator, no congratulation.**
 *
 * Every question is on the page at once rather than one at a time. Reviewing
 * an earlier answer shouldn't require navigation, and a question you can't
 * go back to is a question you have to get right first time — which is a test
 * of nerve, not of understanding.
 */

interface QuizProps {
  questions: Question[];
  title?: string;
  /** Where the reader goes back to when they want to re-read first. */
  chapterHref?: string;
}

export function Quiz({ questions, title, chapterHref }: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitted, setSubmitted] = useState(false);

  const outstanding = useMemo(
    () => unansweredCount(questions, answers),
    [questions, answers],
  );

  const result = useMemo(
    () => (submitted ? markAttempt(questions, answers) : null),
    [submitted, questions, answers],
  );

  const setAnswer = (questionId: string, value: Answer) => {
    // Locked after submission. Not because changing an answer would break the
    // marking — it wouldn't, it's recomputed — but because a result that
    // silently changes underneath the explanation of it is incoherent.
    if (submitted) return;
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const retry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  if (questions.length === 0) return null;

  return (
    <section
      aria-labelledby="quiz-heading"
      className="border-border-subtle bg-surface-raised my-10 rounded-lg border p-6"
    >
      <h2 id="quiz-heading" className="text-h3 mb-1">
        {title ?? "Check your understanding"}
      </h2>
      <p className="text-body-sm text-text-secondary mb-6">
        {questions.length} question{questions.length === 1 ? "" : "s"}. No
        timer, and you can change any answer until you submit.
      </p>

      <ol className="space-y-8">
        {questions.map((question, index) => (
          <li key={question.id}>
            <QuestionCard
              question={question}
              number={index + 1}
              answer={answers[question.id]}
              onChange={(value) => setAnswer(question.id, value)}
              result={
                result?.results.find((r) => r.questionId === question.id) ??
                null
              }
              locked={submitted}
            />
          </li>
        ))}
      </ol>

      {!submitted && (
        <div className="border-border-subtle mt-8 flex flex-wrap items-center gap-4 border-t pt-6">
          <Button onClick={() => setSubmitted(true)}>Submit answers</Button>
          {/*
            Stated, never enforced. Submitting an incomplete attempt is a
            legitimate choice — the reader may want to know what they don't
            know yet. Disabling the button would make the component argue
            with them about it.
          */}
          {outstanding > 0 && (
            <p className="text-body-sm text-text-secondary">
              {outstanding} unanswered. You can submit anyway.
            </p>
          )}
        </div>
      )}

      {result && (
        <QuizResults
          result={result}
          questions={questions}
          chapterHref={chapterHref}
          onRetry={retry}
        />
      )}
    </section>
  );
}
