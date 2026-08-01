/**
 * Header and footer links.
 *
 * Note what's *not* here: prerequisites, related concepts, next/previous
 * chapter. All of that comes out of the knowledge graph at build time. If we
 * hand-maintained it, it would fall out of sync with the content and we
 * wouldn't find out until a reader followed a dead prerequisite.
 */

import type { Route } from "next";

export interface NavItem {
  label: string;
  href: Route;
  description?: string;
}

// Four items. Every time someone adds a fifth, the header stops being
// navigation and starts being a list you have to read.
export const primaryNav: readonly NavItem[] = [
  { label: "Learn", href: "/learn", description: "The curriculum" },
  { label: "Glossary", href: "/glossary", description: "Every term, defined" },
  { label: "Examples", href: "/examples", description: "Runnable code" },
  { label: "About", href: "/about", description: "The project" },
] as const;

export const footerNav: readonly {
  heading: string;
  items: readonly NavItem[];
}[] = [
  {
    heading: "Learn",
    items: [
      { label: "Curriculum", href: "/learn" },
      { label: "Chapter index", href: "/chapters" },
      { label: "Learning paths", href: "/paths" },
      { label: "Glossary", href: "/glossary" },
      { label: "Examples", href: "/examples" },
    ],
  },
  {
    heading: "Project",
    items: [
      { label: "About", href: "/about" },
      { label: "Vision", href: "/vision" },
      { label: "Principles", href: "/principles" },
      { label: "Scope", href: "/scope" },
      { label: "FAQ", href: "/faq" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    heading: "Participate",
    items: [
      { label: "Contributing", href: "/contributing" },
      { label: "Content standards", href: "/standards" },
    ],
  },
  {
    heading: "Legal",
    items: [{ label: "Licence", href: "/license" }],
  },
] as const;

// Kept out of the sitemap and marked noindex.
//
// The certificate verification pages are the important one: each has a real
// person's name on it. Letting those into a search index would publish names
// that were only ever handed over for a certificate.
export const noIndexRoutes: readonly string[] = [
  "/search",
  "/settings",
  "/certificate/verify",
] as const;
