"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { primaryNav } from "@/config/navigation";

/**
 * Primary nav on narrow screens.
 *
 * Focus handling is the bulk of this. When the panel opens, focus moves into
 * it; Escape closes it; and on close focus goes back to the button that
 * opened it, rather than to the top of the document. Tab is contained while
 * it's open so you can't wander into the page behind it.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close on navigation. Adjusting state during render rather than in an
  // effect — React re-runs this component immediately with the new value
  // instead of painting the open panel and then closing it.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("a, button")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>("a, button");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="text-text-secondary hover:text-text-primary inline-flex size-9 items-center justify-center rounded-md"
      >
        {open ? (
          <X className="size-icon-sm" aria-hidden />
        ) : (
          <Menu className="size-icon-sm" aria-hidden />
        )}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      {open ? (
        <div
          id="mobile-nav"
          ref={panelRef}
          className="border-border-subtle bg-surface-page absolute inset-x-0 z-50 border-b shadow-sm"
        >
          <nav aria-label="Main" className="px-4 py-3">
            <ul className="flex flex-col">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-text-primary block py-3 no-underline"
                  >
                    {item.label}
                    {item.description ? (
                      <span className="text-text-secondary block text-sm">
                        {item.description}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
