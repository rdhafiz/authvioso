"use client";

import { useEffect, useState } from "react";

import type { TocEntry } from "@/lib/content/mdx";
import { cn } from "@/lib/utils";

/**
 * In-page table of contents with the current section highlighted.
 *
 * Uses IntersectionObserver rather than scroll maths — cheaper, and it
 * doesn't fire on every frame. The negative bottom margin on the root means a
 * heading counts as "current" once it reaches the upper part of the viewport,
 * which matches where people actually read rather than where the heading
 * technically enters the screen.
 *
 * Clicking a link is a plain anchor jump. No smooth scrolling: over a long
 * chapter it's disorienting, and it makes keyboard navigation worse.
 */
export function TableOfContents({ items }: { items: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    for (const item of items) {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <h2 className="text-text-primary mb-3 font-semibold">On this page</h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id} className={item.depth === 3 ? "pl-4" : undefined}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "location" : undefined}
              className={cn(
                "block no-underline transition-colors",
                activeId === item.id
                  ? "text-text-link font-medium"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
