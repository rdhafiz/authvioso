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

```
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

```
authvioso/
├── content/
│   ├── en/chapters/*.mdx        curriculum text
│   ├── bn/                      same structure, same filenames
│   └── graph/                   nodes, relationships, topics
│
├── src/
│   ├── app/
│   │   ├── (site)/              everything with header + footer
│   │   │   ├── learn/
│   │   │   │   ├── layout.tsx   sidebar shell
│   │   │   │   └── [part]/[chapter]/
│   │   │   └── …                about, faq, glossary, search, …
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
│   │   ├── content/             json-ld
│   │   ├── learning/            chapter components (Sprint 2)
│   │   ├── quiz/ certificate/   later sprints
│   │   └── providers/
│   │
│   ├── config/                  site · i18n · navigation
│   ├── hooks/                   use-hydrated
│   ├── lib/
│   │   ├── content/             curriculum · queries · mdx · paths
│   │   ├── graph/               knowledge graph (types + rules)
│   │   ├── progress/            reading progress
│   │   ├── search/              types + design notes
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
| **Licence undecided**    | No `LICENSE` file. Blocks going public                                                                        |
| **Domain undecided**     | `NEXT_PUBLIC_SITE_URL` points at localhost. Appears on printed certificates, so it can't stay a placeholder   |
| **No logo**              | No favicon, no manifest icons. Declaring files that don't exist would just 404                                |
| **Bangla routing**       | URL shape is decided (`/bn/…`); the App Router mechanism isn't. English only for now                          |
| **No CSP**               | Needs writing against the real asset graph. A permissive placeholder reads as protection without being any    |
| **Search unimplemented** | Types and design notes only. Needs content before an index is worth building                                  |
| **Fixture chapter**      | `content/en/chapters/http-requests-and-responses.mdx` is a pipeline test, not C01. Delete when C01 is written |

---

## Specs

`authvioso_meta/v1.0/` holds 146 documents across 14 folders covering the
vision, curriculum, knowledge graph, content standards, design system, quiz
and certificate systems, workflow and roadmap.

All of them are currently **Draft** — nothing is Locked, so anything built
against them is provisional by definition.
