import type { ReactNode } from "react";

/**
 * HTTP request and response blocks.
 *
 * Almost every chapter in this curriculum ends up showing one, so they get
 * proper components rather than being hand-rolled in fenced blocks each time.
 * Headers render as a definition list so the name/value relationship survives
 * for anyone not reading it visually.
 *
 * One rule that isn't cosmetic: never put a real credential in here. Tokens,
 * cookies and keys in examples get truncated with an ellipsis. Readers copy
 * things, search engines index things, and a plausible-looking token in a
 * chapter is a plausible-looking token in someone's test suite a year later.
 */

interface Header {
  name: string;
  value: string;
  /** Draws attention to the header the surrounding text is about. */
  highlight?: boolean;
}

function HeaderList({ headers }: { headers: Header[] }) {
  return (
    <dl className="flex flex-col gap-0.5 font-mono text-sm">
      {headers.map((header) => (
        <div
          key={header.name}
          className={
            header.highlight
              ? "bg-status-info-surface -mx-2 rounded-sm px-2"
              : undefined
          }
        >
          <dt className="text-text-secondary inline">{header.name}:</dt>{" "}
          <dd className="inline">{header.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const methodColours: Record<string, string> = {
  GET: "text-status-success",
  POST: "text-status-info",
  PUT: "text-status-warning",
  PATCH: "text-status-warning",
  DELETE: "text-status-danger",
};

export function ApiRequest({
  method,
  path,
  headers = [],
  body,
  note,
}: {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  headers?: Header[];
  body?: ReactNode;
  /** One line on what to notice. Often the whole reason it's here. */
  note?: string;
}) {
  return (
    <div className="border-border-subtle bg-surface-raised my-6 overflow-hidden rounded-md border">
      <div className="border-border-subtle flex items-baseline gap-2 border-b px-4 py-2 font-mono text-sm">
        {/* Method is coloured and written out — colour alone would be
            meaningless in greyscale, and the word is the actual information. */}
        <span className={`font-semibold ${methodColours[method] ?? ""}`}>
          {method}
        </span>
        <span className="break-all">{path}</span>
      </div>

      {headers.length > 0 ? (
        <div className="border-border-subtle border-b px-4 py-3">
          <HeaderList headers={headers} />
        </div>
      ) : null}

      {body ? (
        <div className="overflow-x-auto px-4 py-3 font-mono text-sm">
          {body}
        </div>
      ) : null}

      {note ? (
        <p className="border-border-subtle text-text-secondary border-t px-4 py-2 text-sm">
          {note}
        </p>
      ) : null}
    </div>
  );
}

export function ApiResponse({
  status,
  statusText,
  headers = [],
  body,
  note,
}: {
  status: number;
  statusText: string;
  headers?: Header[];
  body?: ReactNode;
  note?: string;
}) {
  // 4xx and 5xx read as failures; everything else is neutral. Deliberately
  // not "green means good" — a 200 on a request that should have been
  // rejected is the worst outcome on the page.
  const isError = status >= 400;

  return (
    <div className="border-border-subtle bg-surface-raised my-6 overflow-hidden rounded-md border">
      <div className="border-border-subtle flex items-baseline gap-2 border-b px-4 py-2 font-mono text-sm">
        <span
          className={`font-semibold ${
            isError ? "text-status-danger" : "text-text-secondary"
          }`}
        >
          {status}
        </span>
        <span>{statusText}</span>
      </div>

      {headers.length > 0 ? (
        <div className="border-border-subtle border-b px-4 py-3">
          <HeaderList headers={headers} />
        </div>
      ) : null}

      {body ? (
        <div className="overflow-x-auto px-4 py-3 font-mono text-sm">
          {body}
        </div>
      ) : null}

      {note ? (
        <p className="border-border-subtle text-text-secondary border-t px-4 py-2 text-sm">
          {note}
        </p>
      ) : null}
    </div>
  );
}
