import type {
  ContentStatus,
  KnowledgeNode,
  NodeId,
  Relationship,
  RelationshipType,
} from "@/types/content";

import type { KnowledgeGraph } from "./load";

/**
 * Questions asked of the knowledge graph.
 *
 * Everything that needs to know how concepts relate comes through here rather
 * than walking the edge list itself — navigation, prerequisite lists, related
 * concepts, search, quiz targeting. One implementation, otherwise they drift
 * apart and start quietly disagreeing about what "related" means.
 *
 * Every function takes the graph rather than fetching it. Keeps them pure,
 * keeps them testable against a fixture, and makes the caller decide when the
 * (async) load happens.
 */

/** Direct outgoing edges of a given type. */
export function edgesOfType(
  graph: KnowledgeGraph,
  id: NodeId,
  type: RelationshipType,
): Relationship[] {
  return (graph.edgesFrom.get(id) ?? []).filter((e) => e.type === type);
}

function resolve(
  graph: KnowledgeGraph,
  ids: Iterable<string>,
): KnowledgeNode[] {
  const out: KnowledgeNode[] = [];
  for (const id of ids) {
    const node = graph.byId.get(id);
    if (node) out.push(node);
  }
  return out;
}

/** What must be understood immediately before this. Direct edges only. */
export function directPrerequisites(
  graph: KnowledgeGraph,
  id: NodeId,
): KnowledgeNode[] {
  return resolve(
    graph,
    edgesOfType(graph, id, "requires").map((e) => e.to),
  );
}

/**
 * The full prerequisite closure, in an order you could actually read.
 *
 * Depth-first post-order, so a node always appears after everything it
 * depends on. That makes the result directly usable as "here is the path to
 * this concept" without a second sort.
 *
 * Cycles are a build failure (see validate.ts), but this still guards against
 * them — a validator that runs at build is no help to a dev server rendering a
 * half-authored graph, and an infinite loop is a worse diagnostic than a
 * missing entry.
 */
export function prerequisiteClosure(
  graph: KnowledgeGraph,
  id: NodeId,
): KnowledgeNode[] {
  const ordered: KnowledgeNode[] = [];
  const settled = new Set<string>();
  const onStack = new Set<string>();

  const visit = (current: NodeId) => {
    if (settled.has(current) || onStack.has(current)) return;
    onStack.add(current);

    for (const edge of edgesOfType(graph, current, "requires")) {
      visit(edge.to);
    }

    onStack.delete(current);
    settled.add(current);

    const node = graph.byId.get(current);
    // The starting node isn't part of its own closure.
    if (node && current !== id) ordered.push(node);
  };

  visit(id);
  return ordered;
}

/** What breaks if this concept is wrong: everything that requires it, directly. */
export function directDependants(
  graph: KnowledgeGraph,
  id: NodeId,
): KnowledgeNode[] {
  return resolve(
    graph,
    (graph.edgesTo.get(id) ?? [])
      .filter((e) => e.type === "requires")
      .map((e) => e.from),
  );
}

/** Everything that depends on this at any depth. Unordered — it's a set. */
export function dependantClosure(
  graph: KnowledgeGraph,
  id: NodeId,
): KnowledgeNode[] {
  const seen = new Set<string>();
  const queue: string[] = [id];

  while (queue.length) {
    const current = queue.shift();
    if (current === undefined) break;
    for (const edge of graph.edgesTo.get(current) ?? []) {
      if (edge.type !== "requires" || seen.has(edge.from)) continue;
      seen.add(edge.from);
      queue.push(edge.from);
    }
  }

  return resolve(graph, seen);
}

/**
 * Concepts worth reading alongside this one.
 *
 * Deliberately not "everything with an edge". `requires` is a prerequisite and
 * is shown as one; surfacing it again under "related" tells the reader the
 * same thing twice in two different words. What is left is the set of edges
 * that genuinely mean *also look at this*: alternatives, extensions, what this
 * unlocks, and the threat/defence pairing.
 *
 * Both directions count. If A contrasts with B, a reader on B wants A.
 */
const RELATED_TYPES: readonly RelationshipType[] = [
  "contrasts-with",
  "extends",
  "enables",
  "threatens",
  "defends",
  "recommends",
];

export function relatedConcepts(
  graph: KnowledgeGraph,
  id: NodeId,
): KnowledgeNode[] {
  const ids = new Set<string>();

  for (const edge of graph.edgesFrom.get(id) ?? []) {
    if (RELATED_TYPES.includes(edge.type)) ids.add(edge.to);
  }
  for (const edge of graph.edgesTo.get(id) ?? []) {
    if (RELATED_TYPES.includes(edge.type)) ids.add(edge.from);
  }

  ids.delete(id);
  return resolve(graph, ids);
}

/**
 * The threats a defence covers, and the defences a threat has.
 *
 * Kept as its own pair rather than folded into `relatedConcepts` because the
 * security chapters render them under their own headings, with the defence's
 * stated limits attached. A defence shown without its limits is the failure
 * mode `SEC-7` exists to prevent, so the limit travels with the edge.
 */
export function defencesFor(
  graph: KnowledgeGraph,
  threatId: NodeId,
): { node: KnowledgeNode; limits?: string }[] {
  return (graph.edgesTo.get(threatId) ?? [])
    .filter((e) => e.type === "defends")
    .flatMap((e) => {
      const node = graph.byId.get(e.from);
      return node ? [{ node, limits: e.limits }] : [];
    });
}

export function threatsAddressedBy(
  graph: KnowledgeGraph,
  defenceId: NodeId,
): KnowledgeNode[] {
  return resolve(
    graph,
    edgesOfType(graph, defenceId, "defends").map((e) => e.to),
  );
}

/** Every node a chapter teaches, in the order the chapter teaches them. */
export function nodesInChapter(
  graph: KnowledgeGraph,
  chapter: string,
): KnowledgeNode[] {
  return graph.byChapter.get(chapter) ?? [];
}

/**
 * A trace: how you get from nothing to this concept, chapter by chapter.
 *
 * Collapses the prerequisite closure onto the chapters that teach it and
 * de-duplicates, preserving first appearance. This is what "you'll need to
 * have read these" renders from.
 */
export function chapterTrace(graph: KnowledgeGraph, id: NodeId): string[] {
  const chapters: string[] = [];
  for (const node of prerequisiteClosure(graph, id)) {
    if (!chapters.includes(node.chapter)) chapters.push(node.chapter);
  }
  return chapters;
}

/**
 * Nodes a reader may be shown as authoritative.
 *
 * Draft and under-review material can be published, but it is labelled and
 * nothing is allowed to depend on it (`KG-002` §5). Callers building
 * "related concepts" lists use this so a Locked chapter never points at a
 * Draft one as though it were settled.
 */
const DEPENDABLE: readonly ContentStatus[] = ["locked", "deprecated"];

export function isDependable(node: KnowledgeNode): boolean {
  return DEPENDABLE.includes(node.status);
}
