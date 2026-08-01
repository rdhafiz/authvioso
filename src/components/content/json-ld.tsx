/**
 * Emits a JSON-LD block.
 *
 * dangerouslySetInnerHTML is unavoidable for a script tag, so the payload is
 * always an object we built ourselves — never anything that came from MDX
 * frontmatter or a URL. JSON.stringify handles quoting, and the `<` escape
 * stops a stray "</script>" inside a string from closing the tag early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
