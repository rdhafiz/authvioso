"use client";

import { ArrowDown, ArrowUp, Check, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Putting steps in order.
 *
 * Deliberately not drag and drop. Dragging is unusable by keyboard without a
 * parallel implementation, awkward on touch, and hostile to anyone with a
 * motor impairment — and this is an assessment, so a reader who cannot operate
 * the control appears not to understand the flow. `DSY-011` §2 is the rule;
 * this is the case where it has teeth.
 *
 * Instead: click a step to append it to the order, then move entries up and
 * down. Every action is a button, so it works with a keyboard, a switch
 * device, and a screen reader without anything extra.
 */

/**
 * The shared icon-button size for the reorder controls.
 *
 * The button preset's `icon` size is 32px, which is under the 44px minimum
 * (`DSY-011` §4). These are the controls an assessment is operated with, so
 * they get the minimum rather than inheriting a size that fails it.
 */
const REORDER_BUTTON = "min-h-11 min-w-11";

interface Props {
  steps: { id: string; text: string }[];
  order: string[];
  disabled: boolean;
  /** Set only after submission. */
  correctOrder?: string[];
  onChange: (order: string[]) => void;
}

export function SequenceInput({
  steps,
  order,
  disabled,
  correctOrder,
  onChange,
}: Props) {
  const placed = order
    .map((id) => steps.find((step) => step.id === id))
    .filter((step): step is { id: string; text: string } => step !== undefined);

  const remaining = steps.filter((step) => !order.includes(step.id));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    if (moved !== undefined) next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <ol className="space-y-2" aria-label="Your order">
        {placed.map((step, index) => {
          // After submission, mark each position rather than the sequence as a
          // whole. "Steps three and four are swapped" is a correction someone
          // can act on; "wrong" is not.
          const rightHere = correctOrder?.[index] === step.id;

          return (
            <li
              key={step.id}
              className={cn(
                "border-border-subtle flex items-center gap-3 rounded-md border p-3",
                correctOrder &&
                  (rightHere
                    ? "border-status-success"
                    : "border-status-danger"),
              )}
            >
              <span className="text-label text-text-secondary w-6 shrink-0">
                {index + 1}
              </span>
              <span className="text-body min-w-0 flex-1">{step.text}</span>

              {correctOrder ? (
                <span
                  className={cn(
                    "text-body-sm inline-flex shrink-0 items-center gap-1",
                    rightHere ? "text-status-success" : "text-status-danger",
                  )}
                >
                  {rightHere ? (
                    <Check className="size-icon-xs" aria-hidden />
                  ) : (
                    <X className="size-icon-xs" aria-hidden />
                  )}
                  {rightHere ? "Right place" : "Wrong place"}
                </span>
              ) : (
                <span className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={REORDER_BUTTON}
                    disabled={disabled || index === 0}
                    onClick={() => move(index, index - 1)}
                    aria-label={`Move "${step.text}" earlier`}
                  >
                    <ArrowUp className="size-icon-xs" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={REORDER_BUTTON}
                    disabled={disabled || index === placed.length - 1}
                    onClick={() => move(index, index + 1)}
                    aria-label={`Move "${step.text}" later`}
                  >
                    <ArrowDown className="size-icon-xs" aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={REORDER_BUTTON}
                    disabled={disabled}
                    onClick={() =>
                      onChange(order.filter((id) => id !== step.id))
                    }
                    aria-label={`Remove "${step.text}" from the order`}
                  >
                    <X className="size-icon-xs" aria-hidden />
                  </Button>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {remaining.length > 0 && !correctOrder && (
        <div>
          <p className="text-body-sm text-text-secondary mb-2">
            Steps still to place
          </p>
          <ul className="space-y-2">
            {remaining.map((step) => (
              <li key={step.id}>
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  onClick={() => onChange([...order, step.id])}
                  className="w-full justify-start gap-3 text-left"
                >
                  <Plus className="size-icon-xs shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1">{step.text}</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
