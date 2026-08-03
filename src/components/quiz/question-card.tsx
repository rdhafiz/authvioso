"use client";

import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Answer, Question, QuestionResult } from "@/types/quiz";

import { ChoiceList } from "./choice-list";
import { MatchingInput } from "./matching-input";
import { SequenceInput } from "./sequence-input";

/**
 * One question, in whichever of the six shapes it takes.
 *
 * The dispatch is a switch on `type` rather than a registry lookup, because
 * the set is closed — `QZ-003` §0 permits exactly six formats — and a switch
 * over a discriminated union is the version the compiler checks. Adding a
 * seventh format should fail to compile here until it is handled.
 */

interface Props {
  question: Question;
  number: number;
  answer: Answer;
  onChange: (value: Answer) => void;
  result: QuestionResult | null;
  locked: boolean;
}

export function QuestionCard({
  question,
  number,
  answer,
  onChange,
  result,
  locked,
}: Props) {
  const given = answer && !Array.isArray(answer) ? answer : {};
  const setPart = (key: string, value: string) =>
    onChange({ ...given, [key]: value });

  return (
    <article
      className={cn(
        "border-border-subtle rounded-md border p-5",
        // Correctness is carried by the icon and the word in the header, not
        // by this border. The tint is a convenience for someone scanning a
        // long results page, and it has to survive being invisible.
        result &&
          (result.correct ? "border-status-success" : "border-status-danger"),
      )}
    >
      <header className="mb-4 flex items-baseline gap-3">
        <span className="text-label text-text-secondary shrink-0">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          {question.type === "scenario" && (
            // The situation is prose the reader has to hold in mind while
            // answering, so it is set apart from the question itself.
            <p className="text-body bg-surface-sunken mb-3 rounded p-3 whitespace-pre-line">
              {question.situation}
            </p>
          )}
          {question.type === "paired-claim" ? (
            <p className="text-body font-medium">{question.claim}</p>
          ) : (
            <p className="text-body font-medium">{question.prompt}</p>
          )}
        </div>
        {result && <Verdict correct={result.correct} />}
      </header>

      <div className="space-y-5 pl-8">
        {question.type === "single-choice" && (
          <ChoiceList
            name={question.id}
            options={question.options}
            selected={Array.isArray(answer) ? answer : []}
            multiple={false}
            disabled={locked}
            correct={locked ? [question.correct] : undefined}
            onChange={onChange}
          />
        )}

        {question.type === "multiple-choice" && (
          <ChoiceList
            name={question.id}
            options={question.options}
            selected={Array.isArray(answer) ? answer : []}
            multiple
            disabled={locked}
            correct={locked ? question.correct : undefined}
            onChange={onChange}
            // The number of correct answers is never stated (`QZ-003` §2).
            hint="Select every option that applies."
          />
        )}

        {question.type === "paired-claim" && (
          <>
            <Part label="Is this true?">
              <ChoiceList
                name={`${question.id}-verdict`}
                options={[
                  { id: "true", text: "True" },
                  { id: "false", text: "False" },
                ]}
                selected={given.verdict ? [given.verdict] : []}
                multiple={false}
                disabled={locked}
                correct={locked ? [String(question.claimIsTrue)] : undefined}
                onChange={(value) =>
                  setPart(
                    "verdict",
                    Array.isArray(value) ? (value[0] ?? "") : "",
                  )
                }
              />
            </Part>
            <Part label="Because">
              <ChoiceList
                name={`${question.id}-why`}
                options={question.justifications}
                selected={given.justification ? [given.justification] : []}
                multiple={false}
                disabled={locked}
                correct={locked ? [question.correctJustification] : undefined}
                onChange={(value) =>
                  setPart(
                    "justification",
                    Array.isArray(value) ? (value[0] ?? "") : "",
                  )
                }
              />
            </Part>
          </>
        )}

        {question.type === "sequence" && (
          <SequenceInput
            steps={question.steps}
            order={Array.isArray(answer) ? answer : []}
            disabled={locked}
            correctOrder={locked ? question.correctOrder : undefined}
            onChange={onChange}
          />
        )}

        {question.type === "matching" && (
          <MatchingInput
            left={question.left}
            right={question.right}
            pairs={given}
            disabled={locked}
            correctPairs={locked ? question.correctPairs : undefined}
            onChange={(pairs) => onChange(pairs)}
          />
        )}

        {question.type === "scenario" &&
          question.parts.map((part) => (
            <Part key={part.id} label={part.label}>
              <ChoiceList
                name={`${question.id}-${part.id}`}
                options={part.options}
                selected={given[part.id] ? [given[part.id] as string] : []}
                multiple={false}
                disabled={locked}
                correct={locked ? [part.correct] : undefined}
                onChange={(value) =>
                  setPart(part.id, Array.isArray(value) ? (value[0] ?? "") : "")
                }
              />
            </Part>
          ))}

        {/*
          Explanations only ever render once the whole attempt is submitted.
          `locked` is that signal — it is set by the parent at submit, not per
          question, so there is no path by which one question's explanation
          appears while another is still answerable.
        */}
        {result && (
          <div className="border-border-subtle space-y-3 border-t pt-4">
            {result.parts && result.parts.length > 0 && (
              <ul className="flex flex-wrap gap-x-6 gap-y-1">
                {result.parts.map((part) => (
                  <li
                    key={part.label}
                    className="text-body-sm flex items-center gap-2"
                  >
                    <Verdict correct={part.correct} compact />
                    <span>{part.label}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-body-sm">{question.explanation}</p>
          </div>
        )}
      </div>
    </article>
  );
}

function Part({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-overline text-text-secondary mb-2">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

/**
 * Correct or not, said in an icon and a word.
 *
 * Never colour alone (`DSY-011` §3). Someone reading in greyscale, in a
 * forced-colours mode, or with a red-green deficiency gets the same
 * information as everyone else because the word is there.
 */
function Verdict({
  correct,
  compact,
}: {
  correct: boolean;
  compact?: boolean;
}) {
  const Icon = correct ? Check : X;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5",
        compact ? "text-body-sm" : "text-label",
        correct ? "text-status-success" : "text-status-danger",
      )}
    >
      <Icon className="size-icon-xs" aria-hidden />
      {correct ? "Correct" : "Not correct"}
    </span>
  );
}
