"use client";

import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Option } from "@/types/quiz";

/**
 * Options for the choice-shaped question types.
 *
 * Native radio and checkbox inputs rather than styled `div`s with ARIA roles.
 * They arrive with keyboard behaviour, grouping, screen reader announcement
 * and forced-colours support already correct, and every reimplementation of
 * them gets at least one of those wrong.
 *
 * After submission the list stays rendered, marked up, and readable — a
 * results view that hides what you chose makes the explanation impossible to
 * follow.
 */

interface Props {
  name: string;
  options: Option[];
  selected: string[];
  multiple: boolean;
  disabled: boolean;
  /** Set only after submission. Its presence is what turns marking on. */
  correct?: string[];
  hint?: string;
  onChange: (value: string[]) => void;
}

export function ChoiceList({
  name,
  options,
  selected,
  multiple,
  disabled,
  correct,
  hint,
  onChange,
}: Props) {
  const toggle = (id: string) => {
    if (!multiple) return onChange([id]);
    onChange(
      selected.includes(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    );
  };

  return (
    <div>
      {hint && <p className="text-body-sm text-text-secondary mb-2">{hint}</p>}
      <ul className="space-y-2">
        {options.map((option) => {
          const chosen = selected.includes(option.id);
          const isCorrect = correct?.includes(option.id) ?? false;
          const marked = correct !== undefined;

          return (
            <li key={option.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                  "border-border-subtle hover:bg-surface-sunken",
                  "focus-within:outline-border-focus focus-within:outline-2 focus-within:outline-offset-2",
                  disabled && "cursor-default",
                  marked && isCorrect && "border-status-success",
                  marked && chosen && !isCorrect && "border-status-danger",
                )}
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={name}
                  value={option.id}
                  checked={chosen}
                  disabled={disabled}
                  onChange={() => toggle(option.id)}
                  className="accent-text-link mt-1 size-4 shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="text-body block">{option.text}</span>

                  {/*
                    Why a distractor was wrong, shown only after submission and
                    only for the one this reader actually picked. Explaining
                    every wrong option to everyone buries the one that matters
                    to them.
                  */}
                  {marked && chosen && !isCorrect && option.whyNot && (
                    <span className="text-body-sm text-text-secondary mt-1 block">
                      {option.whyNot}
                    </span>
                  )}
                </span>

                {marked && (isCorrect || chosen) && (
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
                    {isCorrect ? "Correct answer" : "Your answer"}
                  </span>
                )}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
