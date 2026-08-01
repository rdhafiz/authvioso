/**
 * Types for chapters and the knowledge graph.
 *
 * Most of these fields are required on purpose. A chapter that's missing its
 * objective or its review date should fail the build, not slip through and
 * get caught (or not caught) in review months later.
 */

import type { Locale } from "@/config/i18n";

// Levels describe what a reader can do, not how far through they are.
export type Level =
  "foundation" | "beginner" | "intermediate" | "advanced" | "expert";

// Only "locked" content can be linked to as authoritative or depended on by
// another chapter. Draft can be published, it just has to be labelled.
export type ContentStatus =
  "draft" | "under-review" | "locked" | "deprecated" | "retired";

// C01–C57. Never reuse one, even after a chapter is retired — the ID shows up
// in quiz questions, example folder names and external links.
export type ChapterId = `C${string}`;

// Node IDs are independent of the chapter they currently live in, so a
// concept can move without breaking every reference to it.
export type NodeId = `K-${string}`;

export type PartId = `P${string}`;

export type TopicId = `T-${string}`;

export type NodeType =
  | "definition"
  | "mechanism"
  | "flow-step"
  | "threat"
  | "defense"
  | "trade-off"
  | "decision";

/** A single teachable concept — the smallest thing we can explain and test. */
export interface KnowledgeNode {
  id: NodeId;
  slug: string;
  title: string;
  type: NodeType;
  /**
   * One sentence saying what this concept is.
   *
   * This field does more work than anything else in the model: it's what
   * search matches against, what a hover card shows, and what gets quoted
   * back at someone who gets a question wrong. If you can't get it into one
   * sentence the node is covering too much and wants splitting.
   */
  statement: string;
  chapter: ChapterId;
  anchor: string;
  parent: TopicId;
  difficulty: Level;
  /** Empty means it's an entry point — nothing has to come first. */
  requires: NodeId[];
  status: ContentStatus;
  version: string;
  /** When a human last checked this was still true. Not a file timestamp. */
  reviewed: string;
}

export type RelationshipType =
  | "requires"
  | "recommends"
  | "extends"
  | "contrasts-with"
  | "threatens"
  | "defends"
  | "enables";

export interface Relationship {
  from: NodeId;
  to: NodeId;
  type: RelationshipType;
  /** For "defends" edges: what this mitigation doesn't cover. A defence
      presented as total is worse than no defence described at all. */
  limits?: string;
}

export interface ChapterFrontmatter {
  id: ChapterId;
  title: string;
  part: PartId;
  level: Level;
  /** Minutes. Calculated from word count and asset weight, not eyeballed. */
  readingTime: number;
  nodes: NodeId[];
  /** One objective, phrased as something the reader can do afterwards. Two
      objectives means it should have been two chapters. */
  objective: string;
  /** Direct prerequisites only. The full chain is one hop further on and
      listing it produces a wall nobody reads. */
  requires: ChapterId[];
  /** Nice-to-have background. Shown as "this'll make more sense if…". */
  recommends?: ChapterId[];
  status: ContentStatus;
  version: string;
  reviewed: string;
  owner: string;
  editions: Locale[];
}

export interface Part {
  id: PartId;
  slug: string;
  title: string;
  question: string;
  level: Level | `${Level} → ${Level}`;
  chapters: ChapterId[];
}
