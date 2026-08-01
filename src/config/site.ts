/**
 * Site-wide constants. Anything that needs the name, description or origin
 * imports it from here so we're not chasing hard-coded strings later.
 */

// TODO: swap this out once the domain is registered. It's referenced on the
// printed certificate and the verification URL, so it can't stay a guess
// forever — but nothing breaks in development while it points at localhost.
const FALLBACK_ORIGIN = "http://localhost:3000";

export const siteConfig = {
  // One word, capital A. Not "AuthVioso", not "Auth Vioso".
  name: "Authvioso",

  descriptor: "A Visual Guide to Modern Authentication",

  // Don't reword or reorder this — the three verbs are the order we teach in.
  tagline:
    "See Authentication. Understand Authentication. Build Authentication.",

  // Shows up in search results, so it's written for someone deciding whether
  // to click rather than for a crawler.
  description:
    "Authvioso teaches how authentication actually works — from first principles, with diagrams for every flow, runnable examples, and a way to check that you understood it. Free, open, and vendor-neutral.",

  origin: process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_ORIGIN,

  // "Resource", not "platform" or "product". People categorise you once and
  // then never revisit it.
  category: "Open educational resource",

  repositories: {
    platform: "https://github.com/authvioso/authvioso",
    examples: "https://github.com/authvioso/authvioso_examples",
    meta: "https://github.com/authvioso/authvioso_meta",
  },

  // Null until we pick one. Leaning towards CC BY-SA for the writing and MIT
  // for the example code, since people are meant to copy the code into real
  // projects and copyleft would make that awkward.
  license: null as { content: string; code: string } | null,

  version: "0.0.0-foundation",
} as const;

export type SiteConfig = typeof siteConfig;
