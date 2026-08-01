import Link from "next/link";
import type { Route } from "next";

/**
 * A branching path to a decision.
 *
 * Constraints that are more than styling:
 *
 * Branches split on the reader's *constraints*, never their preferences.
 * "Do you need to revoke access immediately?" is a real branch. "Do you
 * prefer stateless?" is a taste question wearing a decision tree's clothes.
 *
 * Every leaf goes somewhere and links to the concept behind it, so the reader
 * can check the reasoning instead of obeying the tree. "It depends" is not a
 * valid leaf — if it genuinely depends, that dependency is the next question.
 *
 * These belong late in the curriculum. A decision tree handed to someone
 * before they know the options is a recipe, which is exactly what this
 * project exists to replace.
 */

export interface DecisionNode {
  question: string;
  branches: {
    /** The condition, phrased so a reader can tell whether it's true of them. */
    answer: string;
    /** Either another question, or an outcome. Not both. */
    next?: DecisionNode;
    outcome?: { label: string; href?: Route };
  }[];
}

export function DecisionTree({
  root,
  caption,
  /** Stated up front, because a tree is only valid inside its assumptions. */
  assumptions,
}: {
  root: DecisionNode;
  caption?: string;
  assumptions?: string;
}) {
  return (
    <figure className="my-8">
      {assumptions ? (
        <p className="text-text-muted mb-4 text-sm">
          <span className="font-semibold">Assumes: </span>
          {assumptions}
        </p>
      ) : null}

      <Branch node={root} depth={0} />

      {caption ? (
        <figcaption className="text-text-muted mt-3 text-sm">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Branch({ node, depth }: { node: DecisionNode; depth: number }) {
  // Four levels is the ceiling. Deeper than that means the decision hasn't
  // been decomposed properly and the reader has lost the thread anyway.
  if (depth > 3) return null;

  return (
    <div className="border-border-subtle border-l pl-4">
      <p className="font-medium">{node.question}</p>
      <ul className="mt-2 flex flex-col gap-3">
        {node.branches.map((branch) => (
          <li key={branch.answer}>
            <p className="text-text-secondary text-sm">
              <span className="text-text-muted">→ </span>
              {branch.answer}
            </p>
            <div className="mt-2">
              {branch.next ? (
                <Branch node={branch.next} depth={depth + 1} />
              ) : branch.outcome ? (
                <p className="border-border-strong border-l pl-4 text-sm font-medium">
                  {branch.outcome.href ? (
                    <Link href={branch.outcome.href}>
                      {branch.outcome.label}
                    </Link>
                  ) : (
                    branch.outcome.label
                  )}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
