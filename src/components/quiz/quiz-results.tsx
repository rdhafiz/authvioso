"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import type { AttemptResult, Question } from "@/types/quiz";

/**
 * What the reader got, and what they didn't.
 *
 * There is no percentage here and no large number. `QZ-006` is explicit about
 * why: a score tells a reader how they compare to a threshold, which is not
 * information they can act on, and it invites them to treat 80% as "mostly
 * understood" when the missing 20% is a specific concept they will meet again
 * in four chapters' time.
 *
 * So results are two lists of objectives, and every unmet one links to the
 * concept that would fix it — the node, not the whole chapter. Re-reading
 * three thousand words to find the paragraph you missed is a good way to stop
 * re-reading anything.
 *
 * No congratulation either way. Getting them all right is what was supposed to
 * happen, and getting some wrong is what the check is for.
 */

interface Props {
  result: AttemptResult;
  questions: Question[];
  chapterHref?: string;
  onRetry: () => void;
}

export function QuizResults({
  result,
  questions,
  chapterHref,
  onRetry,
}: Props) {
  const { met, unmet } = result;

  // Objective to the node that teaches it, so an unmet objective can link
  // somewhere specific. First question wins; they all map to one node anyway.
  const nodeFor = new Map<string, string>();
  for (const question of questions) {
    if (!nodeFor.has(question.objective)) {
      nodeFor.set(question.objective, question.node);
    }
  }

  return (
    <div
      className="border-border-subtle mt-8 border-t pt-6"
      // Announced when it appears, because submitting scrolls nothing and a
      // sighted reader sees the change immediately.
      role="status"
      aria-live="polite"
    >
      <h3 className="text-h4 mb-4">Where you are</h3>

      {unmet.length > 0 && (
        <section className="mb-6">
          <h4 className="text-overline text-text-secondary mb-2">
            Not yet demonstrated
          </h4>
          <ul className="space-y-2">
            {unmet.map((objective) => {
              const node = nodeFor.get(objective);
              return (
                <li key={objective} className="text-body">
                  {node ? (
                    <Link
                      href={`/glossary#${node}` as Route}
                      className="text-text-link inline-flex items-start gap-2 underline underline-offset-2"
                    >
                      <span>{objective}</span>
                      <ArrowRight
                        className="size-icon-xs mt-1 shrink-0"
                        aria-hidden
                      />
                    </Link>
                  ) : (
                    objective
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {met.length > 0 && (
        <section className="mb-6">
          <h4 className="text-overline text-text-secondary mb-2">
            Demonstrated
          </h4>
          <ul className="space-y-1">
            {met.map((objective) => (
              <li key={objective} className="text-body">
                {objective}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/*
        Both controls carry the 44px minimum explicitly (`DSY-011` §4). The
        button preset's default height is 32px, which is under it — worth
        knowing before copying this pattern elsewhere.
      */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onRetry} className="min-h-11 px-4">
          Try these again
        </Button>
        {chapterHref && (
          <Link
            href={chapterHref as Route}
            className="text-body text-text-link inline-flex min-h-11 items-center px-2 underline underline-offset-2"
          >
            Back to the chapter
          </Link>
        )}
      </div>
    </div>
  );
}
