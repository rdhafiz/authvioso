import path from "node:path";

import type { Locale } from "@/config/i18n";

/**
 * Where content lives on disk.
 *
 * Deliberately outside src/. Chapters are the most valuable thing in this
 * repo and keeping them as plain MDX means they diff properly in review, they
 * survive us changing framework, and anyone forking the project gets the
 * actual material rather than a database dump.
 *
 *   content/
 *     en/chapters/*.mdx
 *     bn/chapters/*.mdx    same filenames, same chapter IDs
 *     graph/               nodes, relationships, topics
 */

export const CONTENT_ROOT = path.join(process.cwd(), "content");

export const contentPaths = {
  root: CONTENT_ROOT,
  chapters: (locale: Locale) => path.join(CONTENT_ROOT, locale, "chapters"),
  pages: (locale: Locale) => path.join(CONTENT_ROOT, locale, "pages"),
  graph: path.join(CONTENT_ROOT, "graph"),
  nodes: path.join(CONTENT_ROOT, "graph", "nodes.json"),
  relationships: path.join(CONTENT_ROOT, "graph", "relationships.json"),
  topics: path.join(CONTENT_ROOT, "graph", "topics.json"),
} as const;
