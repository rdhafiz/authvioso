import { promises as fs } from "node:fs";
import path from "node:path";

import type { KnowledgeNode, Relationship, Topic } from "@/types/content";

/**
 * Reading the knowledge graph off disk.
 *
 * Server-only. The graph is three JSON files that get authored by hand and
 * validated at build; nothing here talks to a network and nothing here ships
 * to the browser.
 *
 * Everything is loaded once and memoised. A build renders 57 chapters plus the
 * curriculum pages, and every one of them asks for prerequisites or related
 * concepts — re-reading and re-indexing 411 nodes each time turns a fast build
 * into a slow one for no reason.
 */

const GRAPH_DIR = path.join(process.cwd(), "content", "graph");

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  topics: Topic[];
  relationships: Relationship[];

  /** Node by id. The lookup every query starts from. */
  byId: ReadonlyMap<string, KnowledgeNode>;
  /** Node by slug, for URL resolution. */
  bySlug: ReadonlyMap<string, KnowledgeNode>;
  /** Nodes taught in a given chapter, in authored order. */
  byChapter: ReadonlyMap<string, KnowledgeNode[]>;
  topicById: ReadonlyMap<string, Topic>;

  /** Outgoing edges, grouped by source node. */
  edgesFrom: ReadonlyMap<string, Relationship[]>;
  /** Incoming edges, grouped by target. Dependants, threatened-by, and so on. */
  edgesTo: ReadonlyMap<string, Relationship[]>;
}

let cached: KnowledgeGraph | null = null;

/**
 * Reads a JSON file, tolerating absence.
 *
 * The graph is authored progressively — nodes land as chapters are written —
 * so an empty or missing file is a normal state, not an error. A malformed
 * file is a different matter and throws with the filename attached, because
 * "Unexpected token } in JSON" on its own has cost everyone an afternoon at
 * some point.
 */
async function readJson<T>(file: string, fallback: T): Promise<T> {
  let raw: string;
  try {
    raw = await fs.readFile(path.join(GRAPH_DIR, file), "utf8");
  } catch {
    return fallback;
  }

  if (raw.trim() === "") return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`content/graph/${file} is not valid JSON: ${detail}`);
  }
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return map;
}

/**
 * Loads and indexes the graph.
 *
 * Note that `relationships` in the JSON is only the *authored* edge list.
 * `requires` lives on the node itself because it is required on every node and
 * belongs with it; this function folds those into the same edge index so
 * queries have one thing to walk rather than two.
 */
export async function loadGraph(): Promise<KnowledgeGraph> {
  if (cached) return cached;

  const [nodes, topics, authored] = await Promise.all([
    readJson<KnowledgeNode[]>("nodes.json", []),
    readJson<Topic[]>("topics.json", []),
    readJson<Relationship[]>("relationships.json", []),
  ]);

  const derived: Relationship[] = [];
  for (const node of nodes) {
    for (const target of node.requires ?? []) {
      derived.push({ from: node.id, to: target, type: "requires" });
    }
    for (const target of node.extends ?? []) {
      derived.push({ from: node.id, to: target, type: "extends" });
    }
    for (const target of node.contrastsWith ?? []) {
      derived.push({ from: node.id, to: target, type: "contrasts-with" });
    }
    for (const target of node.threatens ?? []) {
      derived.push({ from: node.id, to: target, type: "threatens" });
    }
    for (const target of node.defends ?? []) {
      derived.push({
        from: node.id,
        to: target,
        type: "defends",
        limits: node.limits,
      });
    }
    for (const target of node.enables ?? []) {
      derived.push({ from: node.id, to: target, type: "enables" });
    }
  }

  const relationships = [...derived, ...authored];

  cached = {
    nodes,
    topics,
    relationships,
    byId: new Map(nodes.map((n) => [n.id, n])),
    bySlug: new Map(nodes.map((n) => [n.slug, n])),
    byChapter: groupBy(nodes, (n) => n.chapter),
    topicById: new Map(topics.map((t) => [t.id, t])),
    edgesFrom: groupBy(relationships, (r) => r.from),
    edgesTo: groupBy(relationships, (r) => r.to),
  };

  return cached;
}

/**
 * Loads the graph and refuses to return an invalid one.
 *
 * Validation lives here rather than in a separate script because this is the
 * one place every consumer already goes through, so there is no way to render
 * a page against a graph that has not been checked — and no CI step to
 * remember to add.
 *
 * Production throws. Development warns and carries on, because a graph is
 * authored over months and a half-finished one should still render a dev
 * server; a hard failure there would mean the site is unviewable for most of
 * the time the graph is being written, which teaches everyone to skip the
 * check rather than to fix it.
 */
export async function loadValidGraph(
  chapterIds?: readonly string[],
): Promise<KnowledgeGraph> {
  const graph = await loadGraph();

  // Nothing authored yet. There is nothing to be wrong about.
  if (graph.nodes.length === 0) return graph;

  const { validateGraph, formatProblems } = await import("./validate");
  const result = validateGraph(graph, { chapterIds });

  if (!result.valid) {
    const report = formatProblems(result);
    if (process.env.NODE_ENV === "production") throw new Error(report);
    console.warn(`\n${report}`);
  }

  return graph;
}

/**
 * Drops the memoised copy.
 *
 * Only the validator and tests need this — they load, mutate a fixture, and
 * load again. Nothing in the render path should be calling it.
 */
export function clearGraphCache(): void {
  cached = null;
}
