import { ExternalLink } from "lucide-react";

export interface Reading {
  title: string;
  href: string;
  /** Who publishes it. "IETF", "W3C", "OWASP", or a vendor's name. */
  source: string;
  /** What this adds that the chapter didn't. A bare link list is not a
      reading list — it makes the reader open five tabs to find out. */
  adds: string;
  /** Marked so nobody mistakes a product's docs for a neutral source. */
  vendor?: boolean;
  /** When we last confirmed the link resolves and still says this. */
  checked: string;
}

/**
 * Further reading.
 *
 * Primary sources first — the specification that actually governs the thing,
 * not someone's summary of it. Vendor documentation is allowed where it's
 * genuinely the clearest explanation, and it gets labelled as vendor material
 * so the reader can weigh it accordingly.
 *
 * Every entry carries a checked date. Links rot, and a dead citation in a
 * reference is worse than no citation because it implies verification that
 * didn't happen.
 *
 * No affiliate links. Ever.
 */
export function FurtherReading({ items }: { items: Reading[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="further-reading" className="mt-12">
      <h2 id="further-reading" className="text-md mb-4 font-semibold">
        Further reading
      </h2>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              rel="noopener noreferrer"
              className="inline-flex items-baseline gap-1 font-medium"
            >
              {item.title}
              <ExternalLink className="size-icon-xs shrink-0" aria-hidden />
              <span className="sr-only">(external link)</span>
            </a>
            <p className="text-text-secondary mt-1 text-sm">{item.adds}</p>
            <p className="text-text-secondary mt-1 text-sm">
              {item.source}
              {item.vendor ? " · vendor documentation" : null}
              {" · checked "}
              {item.checked}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
