import { loadGraph } from "@/lib/graph";
import { getAllChapters, getChapterHref, getPart } from "@/lib/content/queries";

import type { SearchDocument } from "./types";

/**
 * Assembling the index.
 *
 * Runs at build. The output is a static JSON artefact the browser fetches, so
 * nothing here can depend on a request and nothing here ships as code.
 *
 * There is deliberately no body text yet. Bodies come from the MDX, which
 * means compiling every chapter to plain text — worth doing, and worth doing
 * once there are chapters, because the cost of getting the extraction wrong
 * scales with how much content it silently mangles (`IMP-004`).
 */

export async function buildSearchIndex(): Promise<SearchDocument[]> {
  const documents: SearchDocument[] = [];

  // Chapters. Available before anything is written, because the curriculum
  // structure is settled — so search finds "the chapter about sessions" even
  // while its text is still being drafted.
  for (const chapter of getAllChapters()) {
    const part = getPart(chapter.part);

    documents.push({
      id: chapter.id,
      kind: "chapter",
      title: chapter.title,
      statement: part ? `${part.title}. ${part.question}` : chapter.title,
      aliases: [],
      href: getChapterHref(chapter),
      chapter: chapter.id,
      level: chapter.level,
    });
  }

  // Concepts. The statement is the field that does the work here — it is one
  // sentence describing exactly one idea, which is the densest and least
  // ambiguous text the project produces.
  const graph = await loadGraph();

  for (const node of graph.nodes) {
    const chapter = getAllChapters().find((c) => c.id === node.chapter);
    const href = chapter
      ? `${getChapterHref(chapter)}#${node.anchor}`
      : `/glossary#${node.slug}`;

    documents.push({
      id: node.id,
      kind: "concept",
      title: node.title,
      statement: node.statement,
      // Alternate phrasings are authored, never inferred. An alias guessed
      // from text similarity sends readers somewhere plausible and wrong.
      aliases: node.glossaryTerms ?? [],
      href,
      chapter: node.chapter,
      node: node.id,
      level: node.difficulty,
      draft: node.status === "draft" || node.status === "under-review",
      deprecated: node.status === "deprecated",
    });
  }

  return documents;
}
