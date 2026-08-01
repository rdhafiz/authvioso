# Authvioso

**A Visual Guide to Modern Authentication**

Authvioso is an open-source educational platform for learning modern
authentication. It teaches from first principles — threat before mechanism,
concept before code — through visual explanation, runnable examples, and
verified understanding.

This repository is the **website**. The other two:

| Repository           | Contains                                                        |
| -------------------- | --------------------------------------------------------------- |
| `authvioso`          | This platform and the published curriculum                      |
| `authvioso_examples` | Runnable authentication examples                                |
| `authvioso_meta`     | Planning and governance documentation — **the source of truth** |

> **Status: foundation only.** No content, no UI, no features. This sprint
> established the architecture, configuration, routing skeleton, design tokens,
> and SEO foundation. Every route renders `null`.

---

## Setup

Requires **Node.js ≥ 20.9** and **pnpm**.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

| Command                             | Does                            |
| ----------------------------------- | ------------------------------- |
| `pnpm dev`                          | Development server (Turbopack)  |
| `pnpm build`                        | Production build                |
| `pnpm start`                        | Serve the production build      |
| `pnpm typecheck`                    | TypeScript, no emit             |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                          |
| `pnpm format` / `pnpm format:check` | Prettier                        |
| `pnpm typegen`                      | Regenerate Next.js route types  |
| `pnpm check`                        | typecheck + lint + format check |

---

## Folder structure

```text
authvioso/
├── content/                    Curriculum content, OUTSIDE src by design
│   ├── en/{chapters,pages}/    English edition
│   ├── bn/{chapters,pages}/    Bangla edition — identical identifiers
│   └── graph/                  nodes.json, relationships.json, topics.json
│
├── src/
│   ├── app/
│   │   ├── (site)/             Route group: pages with the site shell
│   │   │   ├── layout.tsx      Header / main / footer shell
│   │   │   ├── page.tsx        /
│   │   │   ├── learn/[part]/[chapter]/
│   │   │   ├── glossary/[term]/
│   │   │   ├── paths/[path]/
│   │   │   ├── certificate/verify/[id]/
│   │   │   └── …               about, vision, principles, scope, faq,
│   │   │                       contributing, standards, changelog, license,
│   │   │                       chapters, examples, search, progress, settings
│   │   ├── layout.tsx          Root: fonts, theme, skip link, metadata
│   │   ├── globals.css         Tailwind theme + token bridge
│   │   ├── not-found.tsx       404
│   │   ├── error.tsx           Error boundary
│   │   ├── sitemap.ts          Generated, with hreflang alternates
│   │   ├── robots.ts
│   │   └── manifest.ts
│   │
│   ├── components/
│   │   ├── ui/                 Generic primitives (shadcn source lives here)
│   │   ├── layout/             Structure, no content of its own
│   │   ├── navigation/         Header, sidebar, breadcrumb, chapter nav
│   │   ├── icons/              Icon vocabulary
│   │   ├── content/            MDX renderers: diagrams, code, glossary links
│   │   ├── learning/           Chapter components — the reason the site exists
│   │   ├── quiz/               Assessment interface
│   │   ├── certificate/        Issuance and verification
│   │   └── providers/          ThemeProvider
│   │
│   ├── config/                 site.ts · i18n.ts · navigation.ts
│   ├── lib/
│   │   ├── content/            MDX loading and paths
│   │   ├── graph/              Knowledge graph access + validation
│   │   ├── seo/                Metadata helpers
│   │   └── utils.ts
│   ├── styles/tokens.css       ← the authoritative source of every value
│   ├── types/content.ts        Chapter, node, and relationship types
│   └── mdx-components.tsx      Required by @next/mdx
│
└── …config                     next.config.ts, eslint.config.mjs, .prettierrc.json
```

Each `src/components/*` folder has a `README.md` recording what belongs in it
and the rules that govern it.

---

## Development

### Design tokens are the single source of values

`src/styles/tokens.css` holds three tiers. **Components only ever touch tier 2.**

```text
1  primitive   --av-blue-600         raw value, theme-independent
2  semantic    --av-text-link        role, resolves per theme
3  component   declared in the component
```

`globals.css` maps Tailwind utilities and shadcn's semantic names onto those
tokens. Nothing declares a colour twice: a component referencing `--av-blue-600`
directly has stepped outside the system.

Two consequences worth knowing:

- **Theming is a token resolution**, not a second stylesheet. `.dark` re-resolves
  semantic tokens; no component knows which theme is active.
- **Reduced motion is one switch.** Every duration token resolves to `0ms` under
  `prefers-reduced-motion`, which removes every animation in the system at once
  rather than relying on each component remembering.

### Content pipeline

MDX is configured for **Turbopack**, which is the default bundler in Next.js 16.
Remark and rehype plugins are therefore declared as **strings** with
serialisable options — functions cannot cross the JS/Rust boundary.

Active plugins: `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`.

Content lives in `content/` rather than `src/` so it stays versioned,
reviewable, diffable, forkable, and survives a change of platform.

### Conventions

- **Path aliases**: `@/components`, `@/config`, `@/lib`, `@/types`, `@/styles`.
- **Typed routes** are on: every internal `href` is checked at compile time.
- **`params` is a `Promise`** in Next.js 16. Synchronous access was removed.
- **Formatting is automated** and never discussed in review.

---

## Known gaps

Recorded so they are not mistaken for oversights. Full list in
`authvioso_meta/v1.0/10_AI_Guidelines/02_PROJECT_CONTEXT.md` §5.2.

| Gap                            | Impact                                                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Licence undecided**          | `LICENSE` is absent. Blocks making the repository public. Proposal on record: CC BY-SA 4.0 for content, MIT for code              |
| **Domain undecided**           | `NEXT_PUBLIC_SITE_URL` defaults to localhost. `authvioso.dev` is a placeholder that appears in printed certificate specifications |
| **No logo**                    | `manifest.ts` declares no icons and there is no favicon. Declaring icons that do not exist would produce broken references        |
| **Bangla routing mechanism**   | URL shape is specified (`/bn/…`); the App Router mechanism that produces it is not decided. Only English routes exist             |
| **No Content-Security-Policy** | Must be written against the real asset graph. A permissive placeholder CSP is worse than none because it reads as protection      |
| **Palette unconfirmed**        | Token values come from the branding proposal; contrast pairs have not been measured with a tool                                   |

---

## Where the specifications live

`authvioso_meta/v1.0/` is the source of truth — 146 documents across 14
folders. Code comments cite them by identifier (`TEC-4`, `DSY-009`, `CRT-008`)
so any rule can be traced to the document that decided it.

| Folder                     | Covers                                                                |
| -------------------------- | --------------------------------------------------------------------- |
| `00_Project/`              | Vision, mission, goals, scope, audience, principles, success criteria |
| `01_Branding/`             | Identity, colour, typography, icons, voice, naming                    |
| `02_Curriculum/`           | 9 parts, 57 chapters, levels, paths, objectives                       |
| `03_Knowledge_Graph/`      | Node model, relationships, dependency validation                      |
| `04_Content_Standards/`    | Chapter template, writing, diagrams, code, quizzes                    |
| `05_Website_Architecture/` | IA, routing, components, accessibility, SEO, performance              |
| `06_Example_Architecture/` | Example repository standards                                          |
| `07_Design_System/`        | Tokens, components, motion, theme                                     |
| `08_Quiz_System/`          | Assessment design, scoring, question authoring                        |
| `09_Certificate/`          | Eligibility, design, generation, verification, security               |
| `10_AI_Guidelines/`        | AI collaboration rules and project context                            |
| `11_Development_Workflow/` | Git, review, release, decision log                                    |
| `12_Roadmap/`              | Phases, milestones, backlog, risk register                            |
| `13_Release/`              | Governance, contribution, licensing, security policy                  |

**Every planning document is currently `Draft`.** Nothing is Locked, so nothing
is authoritative in the sense the standards mean — and implementation against a
Draft specification is provisional by definition.
