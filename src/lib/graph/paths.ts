import type { KnowledgeNode, NodeId } from "@/types/content";

import type { KnowledgeGraph } from "./load";

/**
 * Ordering the graph for reading.
 *
 * A learning path is a claim that you can read these concepts in this order and
 * never meet one before its prerequisites. That claim is checkable, so it gets
 * checked here rather than trusted.
 */

export interface OrderResult {
  /** A valid reading order, or as much of one as exists. */
  order: KnowledgeNode[];
  /** Nodes that could not be placed because they sit in or behind a cycle. */
  unplaceable: NodeId[];
}

/**
 * Topological order over `requires`.
 *
 * Kahn's algorithm, with one deliberate deviation: ties are broken by the
 * order nodes appear in the source rather than arbitrarily. Two concepts with
 * no dependency between them — the cookie attributes, say — have an authored
 * teaching order, and `KG-004` §2 is explicit that child order is a choice
 * rather than something to leave to whatever the JSON happened to list first.
 * Stable output also means a diff of the generated order is readable.
 */
export function topologicalOrder(
  graph: KnowledgeGraph,
  subset?: readonly NodeId[],
): OrderResult {
  const included = subset
    ? new Set<string>(subset)
    : new Set(graph.nodes.map((n) => n.id));

  // Position in the source, so ties break deterministically.
  const rank = new Map<string, number>();
  graph.nodes.forEach((node, index) => rank.set(node.id, index));

  const outstanding = new Map<string, number>();
  const dependants = new Map<string, string[]>();

  for (const id of included) {
    const prerequisites = (graph.edgesFrom.get(id) ?? []).filter(
      (e) => e.type === "requires" && included.has(e.to),
    );
    outstanding.set(id, prerequisites.length);

    for (const edge of prerequisites) {
      const list = dependants.get(edge.to);
      if (list) list.push(id);
      else dependants.set(edge.to, [id]);
    }
  }

  const ready = [...outstanding.entries()]
    .filter(([, count]) => count === 0)
    .map(([id]) => id)
    .sort((a, b) => (rank.get(a) ?? 0) - (rank.get(b) ?? 0));

  const order: KnowledgeNode[] = [];

  while (ready.length) {
    const id = ready.shift();
    if (id === undefined) break;

    const node = graph.byId.get(id);
    if (node) order.push(node);

    for (const next of dependants.get(id) ?? []) {
      const remaining = (outstanding.get(next) ?? 1) - 1;
      outstanding.set(next, remaining);
      if (remaining === 0) {
        // Insert in rank order rather than pushing and re-sorting the queue.
        const position = ready.findIndex(
          (queued) => (rank.get(queued) ?? 0) > (rank.get(next) ?? 0),
        );
        if (position === -1) ready.push(next);
        else ready.splice(position, 0, next);
      }
    }
  }

  const unplaceable = [...outstanding.entries()]
    .filter(([, count]) => count > 0)
    .map(([id]) => id as NodeId);

  return { order, unplaceable };
}

/**
 * Is this sequence a valid reading order?
 *
 * Used to check the curated learning paths in `CUR-006`, and to check that
 * C01–C57 in curriculum order works for the whole graph. Returns the specific
 * violations rather than a boolean, because "this path is invalid" is not
 * actionable and "K-0182 appears before K-0110, which it requires" is.
 */
export function validateOrder(
  graph: KnowledgeGraph,
  sequence: readonly NodeId[],
): { valid: boolean; violations: string[] } {
  const position = new Map<string, number>();
  sequence.forEach((id, index) => position.set(id, index));

  const violations: string[] = [];

  for (const [index, id] of sequence.entries()) {
    for (const edge of graph.edgesFrom.get(id) ?? []) {
      if (edge.type !== "requires") continue;

      const required = position.get(edge.to);
      if (required === undefined) {
        violations.push(`${id} requires ${edge.to}, which is not in the path`);
      } else if (required > index) {
        violations.push(
          `${id} appears at ${index} but requires ${edge.to} at ${required}`,
        );
      }
    }
  }

  return { valid: violations.length === 0, violations };
}

/**
 * The closure of a curated path: the nodes asked for, plus everything they
 * need, in a readable order.
 *
 * This is the calculation that changes what a learning path costs. A path
 * naming twenty concepts whose prerequisites pull in another forty is a
 * forty-concept path, and saying so before publishing it is cheaper than
 * saying so afterwards.
 */
export function pathClosure(
  graph: KnowledgeGraph,
  targets: readonly NodeId[],
): OrderResult {
  const needed = new Set<string>();

  const collect = (id: string) => {
    if (needed.has(id)) return;
    needed.add(id);
    for (const edge of graph.edgesFrom.get(id) ?? []) {
      if (edge.type === "requires") collect(edge.to);
    }
  };

  for (const target of targets) collect(target);

  return topologicalOrder(graph, [...needed] as NodeId[]);
}
