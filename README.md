# Authvioso

**A Visual Guide to Modern Authentication**

Authvioso is an open-source educational platform for learning modern
authentication. It teaches from first principles — threat before mechanism,
concept before code — through visual explanation, runnable examples, and
verified understanding.

This repository is the **website**. The other two:

| Repository           | Contains                                      |
| -------------------- | --------------------------------------------- |
| `authvioso`          | This platform and the published curriculum    |
| `authvioso_examples` | Runnable authentication examples              |
| `authvioso_meta`     | Planning docs — the source of truth for specs |

> **Status: shell complete, no content.** Navigation, MDX rendering, theming
> and SEO all work. The curriculum structure is real — 9 parts, 57 chapters,
> with working prerequisites and prev/next — but the chapters themselves are
> unwritten and render an honest "not written yet" state.

---

## Setup

Needs **Node ≥ 20.9** and **pnpm**.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

| Command                        | Does                            |
| ------------------------------ | ------------------------------- |
| `pnpm dev`                     | Dev server (Turbopack)          |
| `pnpm build`                   | Production build                |
| `pnpm start`                   | Serve the build                 |
| `pnpm typecheck`               | `tsc --noEmit`                  |
| `pnpm lint` / `lint:fix`       | ESLint                          |
| `pnpm format` / `format:check` | Prettier                        |
| `pnpm typegen`                 | Regenerate Next.js route types  |
| `pnpm check`                   | typecheck + lint + format check |

Run `pnpm check` before committing. CI will run the same thing.

---

## Architecture

### Content is data, not code

The curriculum **structure** lives in `src/lib/content/curriculum.ts` — parts,
chapters, slugs, levels, reading times, prerequisites. The curriculum **text**
lives in `content/en/chapters/*.mdx`.

Splitting them is what lets the whole site work before a single chapter is
written. Sidebar, breadcrumbs, prev/next, the chapter index and prerequisite
lists all read the structure; only the chapter body needs the MDX. A chapter
with no MDX file renders its header, prerequisites and neighbours plus a "not
written yet" panel, rather than 404ing.

### Everything visual comes from tokens

`src/styles/tokens.css` is the single source. Three layers:

```text
primitives   --av-blue-600      literal, same in both themes
semantics    --av-text-link     a role, re-resolves per theme
components   built from semantics
```

`globals.css` points Tailwind's theme **and** shadcn's variable names at those
same tokens, so the three systems can't drift. Components read semantics; if
you're reaching for `--av-blue-600` in a component, you either want
`--av-text-link` or the semantic layer needs a new entry.

Dark mode is a re-resolution, not a second stylesheet. Reduced motion zeroes
every duration token at once rather than relying on each component to check.

### Rendering

Static by default. 91 pages prerender at build, including all 57 chapters.
Shiki highlights code at build time, so no highlighter ships to the browser —
it emits both themes as CSS custom properties and the stylesheet picks one.

Client components are deliberately few: theme switcher, mobile nav, search
trigger, table of contents, code copy button, curriculum sidebar. Everything
else is server-rendered, and all reading works without JavaScript.

---

## Folder structure

```text
authvioso/
├── content/
│   ├── _template/chapter.mdx    the master chapter template
│   ├── en/chapters/*.mdx        curriculum text
│   ├── bn/                      same structure, same filenames
│   └── graph/                   nodes, relationships, topics
│
├── src/
│   ├── app/
│   │   ├── (site)/              English, at the root
│   │   │   ├── learn/
│   │   │   │   ├── layout.tsx   sidebar shell
│   │   │   │   └── [part]/[chapter]/
│   │   │   └── …                about, faq, glossary, search, …
│   │   ├── bn/                  Bangla, same paths under /bn (D-0015)
│   │   │   ├── layout.tsx       sets lang + dir
│   │   │   └── learn/[part]/[chapter]/
│   │   ├── layout.tsx           fonts, theme, skip link
│   │   ├── globals.css
│   │   ├── sitemap.ts · robots.ts · manifest.ts
│   │   └── not-found.tsx · error.tsx
│   │
│   ├── components/
│   │   ├── ui/                  button, card, badge, tabs, accordion,
│   │   │                        callout, code-block, copy-button,
│   │   │                        pagination, empty-state, skeleton
│   │   ├── navigation/          header, footer, sidebar, breadcrumbs,
│   │   │                        toc, theme + search + mobile nav
│   │   ├── content/             json-ld, code, diagrams
│   │   ├── learning/            definition, notes, practice, summary,
│   │   │                        chapter header/layout/meta
│   │   ├── pages/               page bodies shared by both editions
│   │   ├── quiz/                the six question types + marking UI
│   │   ├── certificate/         later sprint
│   │   └── providers/
│   │
│   ├── config/                  site · i18n · navigation
│   ├── hooks/                   use-hydrated
│   ├── lib/
│   │   ├── content/             curriculum · queries · mdx · paths
│   │   ├── graph/               load · query · paths · validate
│   │   ├── progress/            state shape + local store
│   │   ├── quiz/                marking. Pure, no React
│   │   ├── search/              types · engine seam · index builder
│   │   └── seo/                 metadata · structured-data
│   ├── styles/tokens.css
│   ├── types/content.ts
│   └── mdx-components.tsx
```

Most `components/*` and `lib/*` folders have a README with the rules for what
goes in them.

---

## How to add a chapter

Two steps, in this order.

**1. Add it to the structure** in `src/lib/content/curriculum.ts`:

```ts
{
  id: "C58",
  slug: "some-new-chapter",
  title: "Some New Chapter",
  part: "P4",
  level: "intermediate",
  readingTime: 15,
  requires: ["C25"],
}
```

Position in the array **is** the reading order, so insert it where it belongs
rather than appending. IDs are permanent — never reuse one, even for a
retired chapter, because they show up in example folder names and quiz
questions.

At this point the route exists. It'll render with a "not written yet" panel.

**2. Write the text** at `content/en/chapters/some-new-chapter.mdx`. The
filename must match the slug exactly. Restart isn't needed; the route picks it
up on next request.

### Frontmatter

Exported as `metadata` from the MDX file. Validated by
`src/lib/content/schema.ts` — unknown tags and a malformed `reviewed` date are
errors, not warnings, because a typo'd tag silently drops the chapter out of
every filter that should have found it.

```mdx
export const metadata = {
  id: "C16",
  title: "Cookie Attributes and What Each One Defends",
  description:
    "One or two sentences, written for someone deciding whether to open it.",
  objective:
    "state what each cookie attribute defends against, and choose a correct set for a given case",
  objectives: [
    "name what each attribute defends",
    "choose an attribute set for a stated situation",
  ],
  nodes: ["K-0141", "K-0142"],
  methods: ["session-cookie"],
  threats: ["csrf", "xss"],
  standards: ["cookies", "http"],
  status: "draft",
  version: "0.1",
  reviewed: "2026-08-01",
  owner: "Ridwanul Hafiz",
  editions: ["en"],
};
```

`objective` is the single testable outcome. `objectives` is the three-to-six
list shown at the top of the chapter.

Structural fields — `part`, `level`, `readingTime`, `requires` — live in
`curriculum.ts` rather than here, because the site needs them before the
chapter exists.

Tag vocabularies are closed lists in `src/types/content.ts`. `standards` names
specifications and algorithms only, never a framework or product: if you could
buy it, it isn't a tag.

---

## How to add MDX content

Chapters are plain MDX. Markdown renders through the element map in
`src/mdx-components.tsx`, so no classes are needed for normal prose.

Available without importing:

````mdx
## A heading

Normal paragraphs, **bold**, `inline code`, tables and lists all just work.

<Callout variant="security" title="What this doesn't cover">
  Callout variants: note, tip, warning, danger, security, deprecated, insecure.
</Callout>

```ts
// Code blocks are highlighted at build time and get a copy button.
const token = await verify(jwt);
```
````

Notes:

- `##` and `###` headings automatically get ids and feed the table of
  contents. `#` is not used in chapter bodies — the page renders the title.
- `insecure` is the variant for code shown specifically to be criticised. It
  is styled to be impossible to mistake for a recommendation, because someone
  will copy it anyway.
- To register a new component for authors, add it to the `components` object
  in `src/mdx-components.tsx`.

### Available components

All of these work in MDX without an import. See
`/preview/chapter` for every one of them rendered on a page.

**Notes** — each means one thing; don't substitute for emphasis.

| Component      | For                                              |
| -------------- | ------------------------------------------------ |
| `InfoBox`      | Context or a cross-reference                     |
| `Tip`          | Makes life easier. Never load-bearing            |
| `Warning`      | A real risk, with its conditions stated          |
| `SecurityNote` | A security consideration — must state its limits |
| `Remember`     | Worth carrying into the next chapter             |
| `DidYouKnow`   | Background. The chapter works without it         |
| `InterviewTip` | How this gets asked out loud                     |
| `Callout`      | The raw component, if none of the above fit      |

**Teaching blocks** — these have required props, so an incomplete one won't
compile.

| Component        | Required props                       |
| ---------------- | ------------------------------------ |
| `Definition`     | `term`                               |
| `BestPractice`   | `reason`, optional `when`            |
| `CommonMistake`  | `tempting`, `consequence`, `instead` |
| `Summary`        | optional `tradeoff`                  |
| `FurtherReading` | `items[]` with `adds` and `checked`  |

`CommonMistake` requires `tempting` on purpose. Readers don't recognise
themselves in a list of things careless people do — they recognise themselves
in something that looked right at the time.

**Diagrams** — all require `alt`, enforced by `Figure`.

| Component             | For                                          |
| --------------------- | -------------------------------------------- |
| `SequenceDiagram`     | Ordered exchanges. Most protocol chapters    |
| `FlowDiagram`         | A path between parties, order implied        |
| `ArchitectureDiagram` | Components, no time dimension                |
| `ConceptMap`          | How ideas relate. Use sparingly              |
| `ComparisonTable`     | Options against criteria. Declares no winner |
| `Timeline`            | An ordered sequence, one participant         |
| `DecisionTree`        | Branch on constraints, never on preference   |
| `Figure`              | Wrap anything else, still requires `alt`     |

`alt` is not a caption. "Diagram of the authorization code flow" conveys
nothing — it needs participants, order, and what each step carries.

The first four render through Mermaid, which is **lazily imported** and only
loads on pages that use one. It's an authoring convenience: published chapters
should mostly ship authored SVG, which is smaller, needs no JavaScript, and
gives real control over the visual language.

**Code and HTTP**

| Component       | For                                       |
| --------------- | ----------------------------------------- |
| `TerminalBlock` | Shell commands. Copy excludes the prompt  |
| `ApiRequest`    | Method, path, headers, body               |
| `ApiResponse`   | Status, headers, body                     |
| `JsonViewer`    | Collapsible JSON with per-key annotations |

Fenced code blocks are highlighted at build time by Shiki and get a copy
button automatically. Never put a real credential in an example — truncate it.

### Adding a plugin

Remark and rehype plugins go in `next.config.ts` as **strings**, not imports.
Turbopack hands the config to Rust and functions can't cross that boundary,
so options have to be serialisable too.

---

## How to add a knowledge node

A node is one teachable concept — the smallest idea that can be explained,
related to other ideas, and tested on its own. Nodes are not pages: they live
inside chapters and are linked to by anchor.

Add an object to `content/graph/nodes.json`:

```json
{
  "id": "K-0182",
  "slug": "session-identifier",
  "title": "Session identifier",
  "type": "definition",
  "statement": "An opaque value the server issues to name one authenticated session.",
  "chapter": "C17",
  "anchor": "the-identifier",
  "parent": "T-04",
  "difficulty": "beginner",
  "requires": ["K-0110"],
  "status": "draft",
  "version": "1.0",
  "reviewed": "2026-01-01"
}
```

Rules that the validator enforces, so you will find out either way:

- **`id` is permanent and never reused**, including after a node is retired.
  It appears in questions, examples and external links.
- **Exactly one parent topic, exactly one chapter.** A node that seems to need
  two is two nodes, or the hierarchy is wrong.
- **`statement` is one sentence.** It is the single most load-bearing field —
  what search returns, what a hover preview shows, and what gets quoted back at
  someone who answers a question wrong. If it will not fit in one sentence, the
  node is too large.
- **Nothing is easier than what it requires.** Difficulty is checked against
  every prerequisite.
- **Nothing Locked may require a Draft.**
- **A `threat` needs at least one node that `defends` against it**, and every
  `defense` must state its `limits`. A mitigation presented as total is worse
  than one described as absent.
- **`contrasts_with` is symmetric** and recorded on both nodes.
- **No cycles.** A cycle means there is no valid order to teach the material in.

Validation runs through `loadValidGraph()`, which every consumer goes through.
It throws in production, so a bad graph fails the build; in development it
warns and carries on, because a half-authored graph should still render a dev
server.

---

## How to add a quiz

Questions live in the bank, not inline in the chapter. A chapter renders its
check with:

```mdx
<Quiz questions={questions} />
```

Six question types are permitted and the set is closed (`QZ-003` §0). They are
a discriminated union in `src/types/quiz.ts`, so a seventh will not compile
until it is specified first.

| Type              | Use for                                                           |
| ----------------- | ----------------------------------------------------------------- |
| `single-choice`   | The default, at every level                                       |
| `multiple-choice` | Completeness — the number correct is never stated                 |
| `paired-claim`    | A claim plus its justification. Plain true/false is not permitted |
| `sequence`        | Flows and protocol steps                                          |
| `matching`        | Mechanisms to threats, defences to attacks                        |
| `scenario`        | Advanced and Expert judgment                                      |

Every question maps to exactly one node and one objective. That is what makes a
wrong answer able to link to the specific concept rather than to three thousand
words of chapter.

What the component deliberately does not do, and why it matters if you are
extending it:

- **No timer.** Timing measures how recently you read something.
- **Nothing auto-advances or auto-submits.** Answers stay changeable until
  submit, and submit is a deliberate act.
- **Explanations appear after the whole attempt**, never per question.
  Per-question feedback turns the second half into a different assessment.
- **No score.** Results are objectives met and unmet.
- **No partial credit.** Three of four required defences is an incomplete
  model, not 75%.
- **Correct and incorrect are marked with an icon and a word**, never colour
  alone.

Marking lives in `src/lib/quiz/evaluate.ts` and is pure — no React, no storage.
It is the part that must not be wrong, because a marking bug tells a reader
they do not understand something they do.

---

## Development workflow

1. Branch off `main` — one concern per branch.
2. Build against the spec in `authvioso_meta/v1.0/`.
3. `pnpm check` locally before pushing.
4. Open a PR; both review passes are required before merge.
5. Squash merge, write the message deliberately.

Formatting is automated and never discussed in review.

---

## Known gaps

| Gap                      | Effect                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Domain undecided**     | `NEXT_PUBLIC_SITE_URL` points at localhost. Appears on printed certificates, so it can't stay a placeholder   |
| **No logo**              | No favicon, no manifest icons. Declaring files that don't exist would just 404                                |
| **Bangla `<html lang>`** | `/bn` sets `lang` on a wrapper, not on `<html>`. Satisfies WCAG 3.1.2, not 3.1.1. Tracked as `IMP-008`        |
| **No CSP**               | Needs writing against the real asset graph. A permissive placeholder reads as protection without being any    |
| **Search unimplemented** | Types and design notes only. Needs content before an index is worth building                                  |
| **Fixture chapter**      | `content/en/chapters/http-requests-and-responses.mdx` is a pipeline test, not C01. Delete when C01 is written |

---

## Specs

`authvioso_meta/v1.0/` holds the specification: vision, curriculum, knowledge
graph, content standards, design system, quiz and certificate systems, workflow
and roadmap.

It was frozen as **v1.0.0-spec** — see `FREEZE.md`. Nearly everything is
**Locked**, which is what makes it safe to build against. Two documents are
deliberately Living and are appended to rather than frozen: `RDM-011`
(implementation tracking) and `RDM-012` (deferred features).

Decisions taken while building are recorded in `00_Project/DECISION_LOG.md`,
and the architectural ones get an ADR in `00_Project/adr/`. If the code and the
specification disagree, one of them is wrong and it is not automatically the
specification.
