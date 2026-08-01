import { Check, Minus, X } from "lucide-react";

/**
 * Side-by-side comparison.
 *
 * Two rules, both structural rather than stylistic:
 *
 * Every option is scored on every criterion. A criterion applied to some
 * columns and left blank in others produces a table that reads as a verdict
 * when it's actually just incomplete.
 *
 * No winner is declared. There's no "recommended" column and no highlighting.
 * The criteria are laid out so a reader can weigh them against their own
 * situation, which is the entire point — the right answer genuinely differs
 * per system, and a table that picks for them teaches the wrong lesson.
 */

/** `null` means "doesn't apply", and renders as a dash rather than a gap. */
export type CellValue = string | boolean | null;

export interface ComparisonColumn {
  key: string;
  label: string;
}

export interface ComparisonRow {
  criterion: string;
  /** Why this criterion matters, if it isn't obvious from the name. */
  note?: string;
  values: Record<string, CellValue>;
}

export function ComparisonTable({
  columns,
  rows,
  caption,
}: {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  caption: string;
}) {
  return (
    <figure className="container-wide my-8">
      <div className="border-border-subtle overflow-x-auto rounded-md border">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-border-subtle border-b">
              <th scope="col" className="px-4 py-3 text-left font-semibold">
                Criterion
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-3 text-left font-semibold"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.criterion}
                className="border-border-subtle border-b last:border-0"
              >
                <th
                  scope="row"
                  className="px-4 py-3 text-left align-top font-medium"
                >
                  {row.criterion}
                  {row.note ? (
                    <span className="text-text-muted mt-1 block text-xs font-normal">
                      {row.note}
                    </span>
                  ) : null}
                </th>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-top">
                    <Cell value={row.values[column.key] ?? null} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="text-text-muted mt-2 text-sm">
        {caption}
      </figcaption>
    </figure>
  );
}

/**
 * Booleans get an icon *and* a word. An icon alone fails in greyscale, and
 * a bare tick tells a screen reader user nothing about which column it's in.
 */
function Cell({ value }: { value: CellValue }) {
  if (value === null) {
    return (
      <span className="text-text-muted inline-flex items-center gap-1.5">
        <Minus className="size-4" aria-hidden />
        Not applicable
      </span>
    );
  }

  if (typeof value === "boolean") {
    return value ? (
      <span className="text-status-success inline-flex items-center gap-1.5">
        <Check className="size-4" aria-hidden />
        Yes
      </span>
    ) : (
      <span className="text-status-danger inline-flex items-center gap-1.5">
        <X className="size-4" aria-hidden />
        No
      </span>
    );
  }

  return <span>{value}</span>;
}
