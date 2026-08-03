/**
 * The knowledge graph, as everything else sees it.
 *
 * Import from here rather than reaching into the individual files. Keeps the
 * surface small enough to reason about and means the internal split can change
 * without touching call sites.
 *
 * Server-only — `load` reads from disk.
 */

export {
  loadGraph,
  loadValidGraph,
  clearGraphCache,
  type KnowledgeGraph,
} from "./load";

export {
  chapterTrace,
  defencesFor,
  dependantClosure,
  directDependants,
  directPrerequisites,
  edgesOfType,
  isDependable,
  nodesInChapter,
  prerequisiteClosure,
  relatedConcepts,
  threatsAddressedBy,
} from "./query";

export {
  pathClosure,
  topologicalOrder,
  validateOrder,
  type OrderResult,
} from "./paths";

export {
  formatProblems,
  validateGraph,
  type GraphProblem,
  type GraphValidation,
} from "./validate";
