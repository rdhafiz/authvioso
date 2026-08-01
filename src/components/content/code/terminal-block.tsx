"use client";

import { useRef } from "react";

import { CopyButton } from "@/components/ui/copy-button";

/**
 * Shell commands.
 *
 * The prompt is rendered rather than being part of the text, so copying gives
 * you the command and not `$ npm install`. Pasting a stray prompt into a
 * terminal is a small, extremely common annoyance and it costs nothing to
 * avoid — `user-select: none` handles manual selection, and the copy button
 * reads from the commands array directly.
 *
 * Output lines are shown muted and are excluded from the copy, because
 * copying expected output back into a shell is never what anyone wants.
 */
export function TerminalBlock({
  commands,
  output,
  title = "Terminal",
}: {
  commands: string[];
  output?: string[];
  title?: string;
}) {
  const commandText = useRef(commands.join("\n"));

  return (
    <figure className="group border-border-subtle bg-surface-sunken relative my-6 overflow-hidden rounded-md border">
      <figcaption className="border-border-subtle text-text-muted flex items-center justify-between border-b px-4 py-2 font-mono text-xs">
        <span>{title}</span>
      </figcaption>

      <div className="absolute top-1.5 right-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <CopyButton getText={() => commandText.current} />
      </div>

      <pre className="overflow-x-auto p-4 font-mono text-sm">
        {commands.map((command) => (
          <div key={command}>
            <span className="text-text-muted select-none">$ </span>
            <span>{command}</span>
          </div>
        ))}
        {output?.map((line) => (
          <div key={line} className="text-text-muted">
            {line}
          </div>
        ))}
      </pre>
    </figure>
  );
}
