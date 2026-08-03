"use client";

import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Pairing items across two sets.
 *
 * A native `<select>` per left-hand item. The same reasoning as the sequence
 * input: line-drawing and drag-to-connect interfaces are pleasant for some
 * readers and unusable for others, and an assessment that cannot be operated
 * reports the wrong thing about whoever cannot operate it.
 *
 * A select also states the available options plainly, which matters here —
 * matching questions are about which pairing is right, not about discovering
 * what the candidates are.
 */

interface Props {
  left: { id: string; text: string }[];
  right: { id: string; text: string }[];
  pairs: Record<string, string>;
  disabled: boolean;
  /** Set only after submission. */
  correctPairs?: Record<string, string>;
  onChange: (pairs: Record<string, string>) => void;
}

export function MatchingInput({
  left,
  right,
  pairs,
  disabled,
  correctPairs,
  onChange,
}: Props) {
  return (
    <ul className="space-y-3">
      {left.map((item) => {
        const chosen = pairs[item.id] ?? "";
        const expected = correctPairs?.[item.id];
        const isCorrect = expected !== undefined && chosen === expected;
        const selectId = `match-${item.id}`;

        return (
          <li
            key={item.id}
            className={cn(
              "border-border-subtle rounded-md border p-3",
              correctPairs &&
                (isCorrect ? "border-status-success" : "border-status-danger"),
            )}
          >
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor={selectId}
                className="text-body min-w-0 flex-1 font-medium"
              >
                {item.text}
              </label>

              <select
                id={selectId}
                value={chosen}
                disabled={disabled}
                onChange={(event) =>
                  onChange({ ...pairs, [item.id]: event.target.value })
                }
                className={cn(
                  "border-border-control bg-surface-raised text-body h-control-md rounded-md border px-3",
                  "focus-visible:outline-border-focus focus-visible:outline-2 focus-visible:outline-offset-2",
                  "min-w-56",
                )}
              >
                <option value="">Choose…</option>
                {right.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.text}
                  </option>
                ))}
              </select>

              {correctPairs && (
                <span
                  className={cn(
                    "text-body-sm inline-flex shrink-0 items-center gap-1",
                    isCorrect ? "text-status-success" : "text-status-danger",
                  )}
                >
                  {isCorrect ? (
                    <Check className="size-icon-xs" aria-hidden />
                  ) : (
                    <X className="size-icon-xs" aria-hidden />
                  )}
                  {isCorrect ? "Correct" : "Not correct"}
                </span>
              )}
            </div>

            {/*
              The right pairing, once marked. Shown rather than left for the
              reader to work out, because the explanation below the question
              refers to it.
            */}
            {correctPairs && !isCorrect && (
              <p className="text-body-sm text-text-secondary mt-2">
                Pairs with:{" "}
                {right.find((option) => option.id === expected)?.text ?? "—"}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
