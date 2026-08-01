import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

import { Callout } from "@/components/ui/callout";
import { CodeBlock } from "@/components/ui/code-block";

/**
 * What MDX files can use.
 *
 * @next/mdx requires this file to exist even when it's empty. In Next 16 the
 * function takes no arguments — older versions passed the inherited map in.
 *
 * Two kinds of thing live here. Element overrides (h2, pre, table…) style
 * plain markdown so chapter authors don't have to think about classes. Named
 * components are the ones authors reach for deliberately, and they're
 * available without an import at the top of every file.
 */

/**
 * Shiki hands us a fully-formed <pre>. Wrapping it rather than replacing it
 * keeps the highlighting on the server and only hydrates the copy button.
 */
function Pre(props: ComponentPropsWithoutRef<"pre">) {
  return (
    <CodeBlock>
      <pre {...props} />
    </CodeBlock>
  );
}

const components: MDXComponents = {
  // rehype-autolink-headings wraps heading text in an anchor, so the styling
  // for those lives on .heading-anchor in globals.css rather than here.
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="mt-12 mb-6 text-2xl font-bold" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    // More space above than below — that gap is what visually binds a heading
    // to the text underneath it.
    <h2 className="mt-12 mb-4 text-xl font-semibold" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-8 mb-3 text-lg font-semibold" {...props} />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4 className="text-md mt-6 mb-2 font-semibold" {...props} />
  ),

  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-4" {...props} />
  ),

  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mb-4 ml-6 list-disc [&>li]:mb-2" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mb-4 ml-6 list-decimal [&>li]:mb-2" {...props} />
  ),

  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="underline" {...props} />
  ),

  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-border-strong text-text-secondary my-6 border-l-4 pl-4 italic"
      {...props}
    />
  ),

  // Inline code only. Block code goes through Pre above.
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="bg-surface-sunken rounded-sm px-1 py-0.5 text-[0.9em]"
      {...props}
    />
  ),
  pre: Pre,

  // Tables scroll inside their own container rather than pushing the page
  // sideways on a phone.
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border-border-subtle border-b px-4 py-2 text-left font-semibold"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      className="border-border-subtle border-b px-4 py-2 align-top"
      {...props}
    />
  ),

  hr: () => <hr className="border-border-subtle my-12" />,

  // Available to authors by name.
  Callout,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
