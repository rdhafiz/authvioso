"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

/**
 * Renders a Mermaid diagram.
 *
 * Mermaid is imported dynamically and only when a diagram is actually on the
 * page. It's a large dependency — several hundred KB — and this site has a
 * tight budget, so it must never end up in the initial bundle. Chapters
 * without a diagram pay nothing.
 *
 * A caveat worth writing down: Mermaid is an authoring convenience, not the
 * end state. Published chapters should mostly ship authored SVG, which is
 * smaller, doesn't need JavaScript, and gives real control over the visual
 * language. Mermaid is for getting a flow down quickly and for diagrams whose
 * layout genuinely doesn't matter.
 *
 * Because it renders client-side, anything inside it is invisible without
 * JavaScript. That's survivable only because <Figure> requires a text
 * alternative — the concept stays reachable either way.
 */
export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          // Mermaid can't read our tokens, so we hand it the nearest built-in
          // and let it match light/dark. Colour fidelity with the design
          // system is one of the reasons authored SVG wins for real chapters.
          theme: resolvedTheme === "dark" ? "dark" : "default",
          securityLevel: "strict",
          fontFamily: "inherit",
        });

        // Unique per render, or Mermaid reuses a stale definition when the
        // theme changes and the diagram silently stops updating.
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, chart);

        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      } catch (cause) {
        // A syntax error in a chapter's diagram shouldn't take the page down.
        // Surface it in dev; readers get the text description regardless.
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Diagram failed");
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme]);

  if (error) {
    return (
      <p className="text-status-danger text-sm">
        This diagram could not be rendered. The text description below still
        describes it.
      </p>
    );
  }

  return <div ref={ref} className="flex justify-center" />;
}
