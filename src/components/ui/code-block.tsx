"use client";

import { useRef, type ReactNode } from "react";

import { CopyButton } from "./copy-button";

/**
 * Wrapper around a Shiki-highlighted <pre>.
 *
 * The highlighting itself happens at build time on the server, so none of
 * Shiki ships to the browser. This wrapper is a client component purely so
 * the copy button can read the block's text, which keeps the hydrated surface
 * to one small div and a button rather than the whole code block.
 *
 * Reading textContent off the DOM instead of threading the raw source down
 * through props: by the time MDX hands us `children` it's a React tree of
 * spans, and reassembling the original string from that is worse than asking
 * the browser what it rendered.
 */
export function CodeBlock({
  children,
  filename,
}: {
  children: ReactNode;
  filename?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <figure className="group border-border-subtle bg-surface-raised relative my-6 overflow-hidden rounded-md border">
      {filename ? (
        <figcaption className="border-border-subtle text-text-secondary border-b px-4 py-2 font-mono text-sm">
          {filename}
        </figcaption>
      ) : null}

      {/* Visible on focus as well as hover, or it's unreachable by keyboard. */}
      <div className="absolute top-2 right-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <CopyButton getText={() => ref.current?.textContent ?? ""} />
      </div>

      {/* Scrolls inside itself. The page never scrolls sideways. */}
      <div ref={ref} className="overflow-x-auto [&_pre]:p-4">
        {children}
      </div>
    </figure>
  );
}
