import type { MDXComponents } from "mdx/types";

/**
 * Components available to every MDX file.
 *
 * @next/mdx won't work at all without this file, even empty — it's a required
 * convention, not an optional hook. Also worth knowing: in Next 16 this
 * function takes no arguments, unlike older versions that passed the existing
 * component map in.
 *
 * Empty for now. Markdown renders as plain HTML and picks up the base styles.
 * As the chapter components land they get registered here so authors can drop
 * <Diagram> or <SecurityCallout> into MDX without an import line at the top of
 * every file.
 */
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
