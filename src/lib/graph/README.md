# graph

Reading and querying the knowledge graph. Nothing here yet.

Everything that needs to know how concepts relate should come through this
folder rather than keeping its own copy — navigation, prerequisite lists,
related concepts, search, quiz targeting. One source, otherwise they quietly
disagree with each other.

Planned split:

| File          | Does                                                     |
| ------------- | -------------------------------------------------------- |
| `load.ts`     | Parse `content/graph/*.json` at build time               |
| `query.ts`    | Prerequisites, dependants, related concepts, full traces |
| `validate.ts` | The checks below                                         |
| `paths.ts`    | Topological ordering for the curated learning paths      |

## Validation runs at build and fails the build

Not warnings. A cycle in the prerequisite graph means there's no valid order
to teach the material in, and that's not something to discover later.

Structural:

- No cycles in `requires`, at any depth
- Every edge points at something that exists and isn't retired
- One parent per node
- No empty topics
- Everything reachable from an entry point

Semantic:

- Nothing is marked easier than its own prerequisites
- Nothing locked depends on a draft
- Every threat has at least one defence pointing at it
- Every defence says what it doesn't cover
- `contrasts-with` exists on both ends
- Every term used appears in the glossary

Against the curriculum:

- Every node belongs to exactly one chapter that exists
- Every learning path is a valid topological order
- C01–C57 in sequence is a valid order for the whole graph

## When a check fails

Fix the model, not the checker. If a dependency is genuinely real and the
validator rejects it, the structure is wrong somewhere — don't delete a true
edge to get a green build.
