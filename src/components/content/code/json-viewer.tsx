"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

/**
 * Collapsible JSON.
 *
 * Built for reading a decoded token payload, where the useful move is
 * expanding one claim and ignoring the rest. Rendered as a tree of buttons
 * and spans rather than a highlighted string so nested objects can actually
 * collapse.
 *
 * `annotations` is the part that earns its keep: it labels individual keys
 * inline — "expiry, as a Unix timestamp" next to `exp` — which is otherwise
 * a paragraph of prose repeating the shape of the object underneath it.
 *
 * Keep the payloads small. This is a teaching aid, not a debugger, and
 * pasting a 200-line response into a chapter has already lost the reader.
 */

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export function JsonViewer({
  data,
  annotations = {},
  initiallyExpanded = true,
}: {
  data: Json;
  /** Key → short explanation, shown greyed beside the value. */
  annotations?: Record<string, string>;
  initiallyExpanded?: boolean;
}) {
  return (
    <div className="border-border-subtle bg-surface-raised my-6 overflow-x-auto rounded-md border p-4 font-mono text-sm">
      <Node
        value={data}
        annotations={annotations}
        depth={0}
        defaultOpen={initiallyExpanded}
      />
    </div>
  );
}

function Node({
  value,
  annotations,
  depth,
  defaultOpen,
  keyName,
}: {
  value: Json;
  annotations: Record<string, string>;
  depth: number;
  defaultOpen: boolean;
  keyName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const isObject = typeof value === "object" && value !== null;

  if (!isObject) {
    return (
      <div style={{ paddingLeft: depth * 16 }}>
        {keyName ? (
          <span className="text-text-link">&quot;{keyName}&quot;: </span>
        ) : null}
        <Primitive value={value} />
        {keyName && annotations[keyName] ? (
          <span className="text-text-muted ml-3 font-sans text-xs">
            {annotations[keyName]}
          </span>
        ) : null}
      </div>
    );
  }

  const entries: [string, Json][] = Array.isArray(value)
    ? value.map((item, index) => [String(index), item])
    : Object.entries(value);

  const open_ = Array.isArray(value) ? "[" : "{";
  const close = Array.isArray(value) ? "]" : "}";

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="hover:text-text-primary inline-flex items-center gap-1"
      >
        {open ? (
          <ChevronDown className="size-3" aria-hidden />
        ) : (
          <ChevronRight className="size-3" aria-hidden />
        )}
        {keyName ? (
          <span className="text-text-link">&quot;{keyName}&quot;: </span>
        ) : null}
        <span>{open_}</span>
        {!open ? (
          <span className="text-text-muted">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
            {close}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          {entries.map(([key, child]) => (
            <Node
              key={key}
              keyName={Array.isArray(value) ? undefined : key}
              value={child}
              annotations={annotations}
              depth={depth + 1}
              defaultOpen={defaultOpen}
            />
          ))}
          <div style={{ paddingLeft: depth * 16 }}>{close}</div>
        </>
      ) : null}
    </div>
  );
}

function Primitive({ value }: { value: Json }) {
  if (typeof value === "string") {
    return <span className="text-status-success">&quot;{value}&quot;</span>;
  }
  if (typeof value === "number") {
    return <span className="text-status-warning">{value}</span>;
  }
  if (typeof value === "boolean") {
    return <span className="text-status-info">{String(value)}</span>;
  }
  return <span className="text-text-muted">null</span>;
}
