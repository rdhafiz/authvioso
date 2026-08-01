import type { ReactNode } from "react";

import { Callout } from "@/components/ui/callout";

/**
 * The note-style components chapters use.
 *
 * All of these are Callout underneath. They exist as named components because
 * `<Tip>` reads better in MDX than `<Callout variant="tip">`, and because a
 * name is harder to misuse than a prop — nobody accidentally writes
 * `<SecurityNote>` around a stylistic aside.
 *
 * Each one means exactly one thing. Don't reach for Warning because a note
 * needs emphasis; once a treatment has two meanings, readers stop trusting
 * all of them.
 */

interface NoteProps {
  title?: string;
  children: ReactNode;
}

/** Context or a cross-reference. The neutral one. */
export function InfoBox({ title, children }: NoteProps) {
  return (
    <Callout variant="note" title={title}>
      {children}
    </Callout>
  );
}

/** Something that makes the reader's life easier. Never load-bearing —
    a tip the chapter depends on is not a tip, it's the explanation. */
export function Tip({ title, children }: NoteProps) {
  return (
    <Callout variant="tip" title={title}>
      {children}
    </Callout>
  );
}

/** A real risk with conditions attached. Say what the conditions are. */
export function Warning({ title, children }: NoteProps) {
  return (
    <Callout variant="warning" title={title}>
      {children}
    </Callout>
  );
}

/**
 * A security consideration for the concept being taught.
 *
 * Has to say what the defence does *not* cover. A mitigation presented as
 * complete is worse than not mentioning it, because the reader stops looking.
 */
export function SecurityNote({ title, children }: NoteProps) {
  return (
    <Callout variant="security" title={title}>
      {children}
    </Callout>
  );
}

/** Something worth carrying into the next chapter. Use sparingly — if every
    other paragraph is worth remembering, none of them are. */
export function Remember({ title, children }: NoteProps) {
  return (
    <Callout variant="remember" title={title}>
      {children}
    </Callout>
  );
}

/** Background colour. Genuinely optional: the chapter must make sense with
    every one of these deleted. */
export function DidYouKnow({ title, children }: NoteProps) {
  return (
    <Callout variant="did-you-know" title={title}>
      {children}
    </Callout>
  );
}

/**
 * How this tends to come up when someone is asked about it out loud.
 *
 * These exist because readers ask for them, not because the curriculum is
 * shaped around interviews. If what gets asked in interviews ever pulls
 * against teaching the subject properly, the teaching wins and these go.
 */
export function InterviewTip({ title, children }: NoteProps) {
  return (
    <Callout variant="interview" title={title}>
      {children}
    </Callout>
  );
}
