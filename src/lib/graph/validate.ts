import type { KnowledgeNode, Level, NodeId } from "@/types/content";

import type { KnowledgeGraph } from "./load";

/**
 * Graph validation.
 *
 * These run at build and fail it. Not warnings — a cycle in the prerequisite
 * graph means there is no valid order to teach the material in, and that is
 * not something to find out after twenty chapters are written.
 *
 * The rules are `KG-006` §4 made mechanical. Each one below names the rule it
 * enforces, so a failing check can be argued with by reading the specification
 * rather than by reading this file.
 *
 * When a check fails, fix the model, not the checker. If a dependency is
 * genuinely real and the validator rejects it, the structure is wrong
 * somewhere — deleting a true edge to get a green build is how a graph stops
 * describing the subject.
 */

export interface GraphProblem {
  /** Which rule group, for grouping the output. */
  rule: string;
  /** The node or topic at fault, where there is one. */
  subject?: string;
  message: string;
}

export interface GraphValidation {
  valid: boolean;
  problems: GraphProblem[];
  /** Counts, printed on success so a green run still says what it checked. */
  checked: { nodes: number; topics: number; edges: number };
}

const LEVEL_ORDER: Record<Level, number> = {
  foundation: 0,
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export function validateGraph(
  graph: KnowledgeGraph,
  options: { chapterIds?: readonly string[] } = {},
): GraphValidation {
  const problems: GraphProblem[] = [];
  const fail = (rule: string, message: string, subject?: string) =>
    problems.push({ rule, subject, message });

  const { nodes, topics, byId, topicById } = graph;

  // --- Identity -------------------------------------------------------------
  // Duplicate IDs are checked first because every later rule assumes lookup is
  // unambiguous, and the failures they'd produce would all be misleading.

  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  for (const node of nodes) {
    if (seenIds.has(node.id)) fail("identity", "duplicate node id", node.id);
    seenIds.add(node.id);

    if (seenSlugs.has(node.slug)) {
      fail("identity", `duplicate slug "${node.slug}"`, node.id);
    }
    seenSlugs.add(node.slug);

    if (!/^K-\d{4}$/.test(node.id)) {
      fail("identity", "id must be K-#### with four digits", node.id);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(node.slug)) {
      fail("identity", `slug "${node.slug}" is not kebab-case ASCII`, node.id);
    }
  }

  // --- Structural -----------------------------------------------------------

  // Every edge points at something that exists and isn't retired.
  for (const edge of graph.relationships) {
    const target = byId.get(edge.to);
    if (!target) {
      fail(
        "structure",
        `${edge.type} edge points at ${edge.to}, which does not exist`,
        edge.from,
      );
      continue;
    }
    if (target.status === "retired") {
      fail(
        "structure",
        `${edge.type} edge points at ${edge.to}, which is retired`,
        edge.from,
      );
    }
  }

  // Exactly one parent, and it has to be a topic that exists.
  for (const node of nodes) {
    if (!node.parent) {
      fail("structure", "no parent topic", node.id);
    } else if (!topicById.has(node.parent)) {
      fail("structure", `parent ${node.parent} does not exist`, node.id);
    }
  }

  // No empty topics. A container with nothing in it is either a plan someone
  // abandoned or a hierarchy level that shouldn't exist.
  for (const topic of topics) {
    if (topic.children.length === 0) {
      fail("structure", "topic has no children", topic.id);
    }
    if (topic.parent && !topicById.has(topic.parent)) {
      fail("structure", `parent ${topic.parent} does not exist`, topic.id);
    }
  }

  // No cycles in `requires`, at any depth.
  for (const cycle of findCycles(graph)) {
    fail("structure", `prerequisite cycle: ${cycle.join(" → ")}`, cycle[0]);
  }

  // Everything reachable from an entry point. An unreachable node is one no
  // reading order ever arrives at, which means it is taught nowhere.
  const reachable = reachableFromEntryPoints(graph);
  for (const node of nodes) {
    if (!reachable.has(node.id)) {
      fail("structure", "not reachable from any entry point", node.id);
    }
  }

  // --- Semantic -------------------------------------------------------------

  for (const node of nodes) {
    // Nothing is easier than what it depends on (`KG-002` §3).
    for (const id of node.requires ?? []) {
      const prerequisite = byId.get(id);
      if (!prerequisite) continue;
      if (LEVEL_ORDER[node.difficulty] < LEVEL_ORDER[prerequisite.difficulty]) {
        fail(
          "semantic",
          `is ${node.difficulty} but requires ${id}, which is ${prerequisite.difficulty}`,
          node.id,
        );
      }
    }

    // Nothing Locked depends on a Draft.
    if (node.status === "locked") {
      for (const id of node.requires ?? []) {
        const prerequisite = byId.get(id);
        if (!prerequisite) continue;
        if (
          prerequisite.status === "draft" ||
          prerequisite.status === "under-review"
        ) {
          fail(
            "semantic",
            `is locked but requires ${id}, which is ${prerequisite.status}`,
            node.id,
          );
        }
      }
    }

    // Every defence says what it doesn't cover (`SEC-7`).
    if (node.type === "defense" && !node.limits?.trim()) {
      fail(
        "semantic",
        "defense node must state its limits — what it does not cover",
        node.id,
      );
    }

    // A statement is one sentence. Not enforced by counting full stops, which
    // punishes "e.g." and abbreviations; length is the honest proxy for "this
    // grew into a paragraph".
    if (!node.statement?.trim()) {
      fail("semantic", "missing statement", node.id);
    } else if (node.statement.length > 240) {
      fail(
        "semantic",
        `statement is ${node.statement.length} characters; one sentence is the rule, so the node is probably too large`,
        node.id,
      );
    }
  }

  // Every threat has at least one defence pointing at it (`SEC-3`).
  for (const node of nodes) {
    if (node.type !== "threat") continue;
    const defended = (graph.edgesTo.get(node.id) ?? []).some(
      (e) => e.type === "defends",
    );
    if (!defended) {
      fail("semantic", "threat has no defence pointing at it", node.id);
    }
  }

  // contrasts-with is symmetric and recorded on both ends (`KG-004` §4).
  for (const node of nodes) {
    for (const id of node.contrastsWith ?? []) {
      const other = byId.get(id);
      if (!other) continue;
      if (!(other.contrastsWith ?? []).includes(node.id)) {
        fail(
          "semantic",
          `contrasts-with ${id}, but ${id} does not contrast back`,
          node.id,
        );
      }
    }
  }

  // --- Against the curriculum ----------------------------------------------

  if (options.chapterIds) {
    const chapters = new Set(options.chapterIds);
    for (const node of nodes) {
      if (!node.chapter) {
        fail("curriculum", "no chapter", node.id);
      } else if (!chapters.has(node.chapter)) {
        fail("curriculum", `chapter ${node.chapter} does not exist`, node.id);
      }
      if (!node.anchor?.trim()) {
        fail("curriculum", "no anchor, so it cannot be linked to", node.id);
      }
    }

    // Reading the chapters in curriculum order must be a valid order for the
    // whole graph: nothing may require a concept taught later.
    const position = new Map<string, number>();
    options.chapterIds.forEach((id, index) => position.set(id, index));

    for (const node of nodes) {
      const here = position.get(node.chapter);
      if (here === undefined) continue;
      for (const id of node.requires ?? []) {
        const prerequisite = byId.get(id);
        if (!prerequisite) continue;
        const there = position.get(prerequisite.chapter);
        if (there === undefined) continue;
        if (there > here) {
          fail(
            "curriculum",
            `is taught in ${node.chapter} but requires ${id} from ${prerequisite.chapter}, which comes later`,
            node.id,
          );
        }
      }
    }
  }

  return {
    valid: problems.length === 0,
    problems,
    checked: {
      nodes: nodes.length,
      topics: topics.length,
      edges: graph.relationships.length,
    },
  };
}

/**
 * Finds prerequisite cycles.
 *
 * Iterative depth-first with an explicit stack. Recursion would be shorter and
 * would also blow up on a deep chain, and the longest chain in the curriculum
 * is 23 chapters before anyone adds to it.
 *
 * Returns each cycle once, as the path around it, so the error message can
 * show the loop rather than just naming a node inside one.
 */
function findCycles(graph: KnowledgeGraph): NodeId[][] {
  const cycles: NodeId[][] = [];
  const settled = new Set<string>();
  const path: NodeId[] = [];
  const onPath = new Set<string>();

  const requires = (id: string): NodeId[] =>
    (graph.edgesFrom.get(id) ?? [])
      .filter((e) => e.type === "requires")
      .map((e) => e.to);

  const walk = (id: NodeId) => {
    if (settled.has(id)) return;

    if (onPath.has(id)) {
      const start = path.indexOf(id);
      if (start !== -1) cycles.push([...path.slice(start), id]);
      return;
    }

    onPath.add(id);
    path.push(id);

    for (const next of requires(id)) walk(next);

    path.pop();
    onPath.delete(id);
    settled.add(id);
  };

  for (const node of graph.nodes) walk(node.id);
  return cycles;
}

/**
 * Every node arrived at by starting from the entry points and following
 * dependants.
 *
 * An entry point is a node with no prerequisites. Walking *up* from there —
 * from a concept to the things that require it — reaches everything with a
 * path from first principles. Whatever is left over is either orphaned or
 * sitting behind a cycle.
 */
function reachableFromEntryPoints(graph: KnowledgeGraph): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = graph.nodes
    .filter((n) => (n.requires ?? []).length === 0)
    .map((n) => n.id);

  for (const id of queue) reachable.add(id);

  while (queue.length) {
    const current = queue.shift();
    if (current === undefined) break;
    for (const edge of graph.edgesTo.get(current) ?? []) {
      if (edge.type !== "requires" || reachable.has(edge.from)) continue;
      reachable.add(edge.from);
      queue.push(edge.from);
    }
  }

  return reachable;
}

/** Formats problems for a terminal. Grouped by rule, because they cluster. */
export function formatProblems(result: GraphValidation): string {
  if (result.valid) {
    const { nodes, topics, edges } = result.checked;
    return `Graph valid — ${nodes} nodes, ${topics} topics, ${edges} edges.`;
  }

  const groups = new Map<string, GraphProblem[]>();
  for (const problem of result.problems) {
    const bucket = groups.get(problem.rule);
    if (bucket) bucket.push(problem);
    else groups.set(problem.rule, [problem]);
  }

  const lines: string[] = [`${result.problems.length} graph problem(s):`, ""];

  for (const [rule, items] of groups) {
    lines.push(`  ${rule}`);
    for (const item of items) {
      lines.push(
        `    ${item.subject ? `${item.subject}: ` : ""}${item.message}`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

export type { KnowledgeNode };
