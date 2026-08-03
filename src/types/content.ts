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

  // --- Optional, per KG-002 §4 ---------------------------------------------
  // Absence is meaningful. A node with no `defends` isn't a node whose
  // defences we haven't got round to listing; it's a node that defends
  // nothing. Never fill these with a placeholder to make a shape uniform.

  /** Concepts this one adds capability to. */
  extends?: NodeId[];
  /** Different answers to the same problem. Symmetric — recorded on both. */
  contrastsWith?: NodeId[];
  /** For threat nodes: what the attack targets. */
  threatens?: NodeId[];
  /** For defense nodes: which threats this mitigates. */
  defends?: NodeId[];
  /** What becomes possible once this is understood. */
  enables?: NodeId[];

  /**
   * What this defence does *not* cover.
   *
   * Required on every defense node and checked at build. A mitigation
   * presented as total is worse than one described as absent, because the
   * reader stops looking (`SEC-7`).
   */
  limits?: string;

  glossaryTerms?: string[];
  standards?: StandardTag[];
  threatTags?: ThreatTag[];
  methodTags?: MethodTag[];
  tags?: string[];

  /** The runnable example demonstrating it. */
  example?: string;
  /** The learning objective it serves. */
  objective?: string;
  /** The node this supersedes, and what replaced it. */
  deprecates?: NodeId;
  deprecatedBy?: NodeId;
  /** Which language editions carry it. */
  editions?: Locale[];
  /** Authoring context. Never rendered. */
  notes?: string;
}

/**
 * A container in the hierarchy: root, topic, or subtopic.
 *
 * Topics carry no teaching content — that lives in nodes. A topic exists to
 * group and to order, which is why it has `children` and no `statement`.
 */
export interface Topic {
  id: TopicId;
  slug: string;
  title: string;
  /** Exactly one, except for roots. */
  parent?: TopicId;
  /**
   * Authored order, never alphabetical. Where children have no dependency
   * between them the sequence is a teaching choice, and it gets recorded
   * rather than left to whatever the JSON happened to list first
   * (`KG-004` §2).
   */
  children: (TopicId | NodeId)[];
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

/**
 * Tag vocabularies.
 *
 * Closed lists on purpose. Free-text tags sprawl within a month and then
 * nothing can be filtered reliably. Adding a value is a deliberate edit here,
 * not something that happens by typing it into frontmatter.
 *
 * Technology tags name specifications and algorithms only — never a
 * framework, library or product. The test is blunt: if you could buy it, it
 * isn't a tag.
 */
export const methodTags = [
  "password",
  "session-cookie",
  "bearer-token",
  "api-key",
  "oauth-delegated",
  "oidc-federated",
  "mfa",
  "otp",
  "magic-link",
  "passwordless",
  "webauthn-passkey",
  "machine-to-machine",
] as const;

export const threatTags = [
  "xss",
  "csrf",
  "session-fixation",
  "session-hijacking",
  "token-theft",
  "replay",
  "mitm",
  "phishing",
  "brute-force",
  "credential-stuffing",
  "account-enumeration",
  "timing-attack",
  "open-redirect",
  "privilege-escalation",
  "clickjacking",
  "key-compromise",
] as const;

export const standardTags = [
  "http",
  "tls",
  "cookies",
  "cors",
  "oauth2",
  "pkce",
  "oidc",
  "jwt",
  "jws",
  "jwe",
  "jwk",
  "webauthn",
  "fido2",
  "totp",
  "hotp",
  "argon2",
  "bcrypt",
  "scrypt",
] as const;

export type MethodTag = (typeof methodTags)[number];
export type ThreatTag = (typeof threatTags)[number];
export type StandardTag = (typeof standardTags)[number];

/**
 * What a chapter file declares about itself.
 *
 * Split into two halves. The structural fields — id, slug, part, level,
 * readingTime, requires — live in curriculum.ts because the site needs them
 * before the chapter is written. Everything here is authored alongside the
 * text and travels with it.
 *
 * Most of it is required. A chapter without a description or a review date
 * should fail the build rather than reach review and be argued about.
 */
export interface ChapterFrontmatter {
  id: ChapterId;
  title: string;
  part: PartId;
  level: Level;
  /** Minutes. Calculated from word count and asset weight, not eyeballed. */
  readingTime: number;

  /**
   * One or two sentences for search results and link previews. Written for
   * someone deciding whether to open it — an auto-extracted first paragraph
   * almost never describes what a page answers.
   */
  description: string;

  /**
   * What the reader can do afterwards, phrased as an observable action.
   *
   * "Understand sessions" isn't checkable and doesn't belong here. "Compare
   * server-side and client-side sessions and name what each gives up" is.
   * One per chapter — two means it should have been two chapters.
   */
  objective: string;

  /**
   * The specific things covered, shown at the top of the chapter. Three to
   * six. Longer than that and nobody reads them.
   */
  objectives?: string[];

  nodes: NodeId[];

  /** Direct prerequisites only. The full chain is one hop further on. */
  requires: ChapterId[];
  /** Nice-to-have background. Shown as "this'll make more sense if…". */
  recommends?: ChapterId[];
  /** Chapters worth reading alongside this one, beyond the graph edges. */
  related?: ChapterId[];

  methods?: MethodTag[];
  threats?: ThreatTag[];
  standards?: StandardTag[];

  status: ContentStatus;
  version: string;
  /** When a human last checked this against reality. Not a file timestamp. */
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
