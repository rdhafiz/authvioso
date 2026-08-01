"use client";

import { useEffect, useRef } from "react";

/**
 * A thin line showing how far through the page you are.
 *
 * Written imperatively — the scroll handler writes to a ref's style rather
 * than calling setState. Scroll fires constantly, and re-rendering React on
 * every frame to move a bar 1% is a lot of work for a decoration. This way
 * the whole thing costs one style write per frame.
 *
 * Position only. It doesn't imply pace, there's no time estimate counting
 * down, and it never congratulates anyone for reaching the bottom.
 *
 * aria-hidden because it duplicates information the scrollbar already gives
 * assistive technology, and announcing a percentage that changes on every
 * scroll event would be intolerable.
 */
export function ReadingProgressBar() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      const element = ref.current;
      if (!element) return;

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      // Short pages aren't scrollable, and dividing by zero would put the bar
      // at NaN% — which renders as full.
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      element.style.transform = `scaleX(${Math.min(Math.max(ratio, 0), 1)})`;
    }

    function onScroll() {
      // Coalesce to one write per frame.
      if (frame === 0) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5"
    >
      <div ref={ref} className="bg-text-link h-full origin-left scale-x-0" />
    </div>
  );
}
