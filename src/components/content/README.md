# content

Components MDX can use: diagrams, code blocks, glossary links, cross-references
to specific concepts.

Register them in `src/mdx-components.tsx` so chapter authors don't need an
import block at the top of every file.

**Diagrams need a text alternative and it isn't a caption.** "Diagram of the
authorization code flow" tells a screen reader user nothing. It needs the
participants, the order, and what each message carries — enough that someone
who can't see the image follows the same argument. If that's hard to write,
the diagram is usually the thing that's confused.

Also: keep real text in the SVG rather than outlining it, or the diagrams stop
being searchable and translatable. And code ligatures stay off — people are
reading these to find out what the characters actually are.
