import { siteConfig } from "@/config/site";
import type { Crumb } from "@/components/navigation/breadcrumbs";

/**
 * JSON-LD builders.
 *
 * Rule of thumb: only describe what's actually on the page. Marking up
 * content that isn't visible is misrepresentation, and it's the kind that
 * gets a site penalised rather than rewarded.
 *
 * Notable omissions, all deliberate: no Review, no AggregateRating, no Offer.
 * Nothing here is rated or sold. FAQPage is used once, on the actual FAQ —
 * sprinkling it over chapters to farm rich results is exactly the
 * manipulation we said we wouldn't do.
 */

type JsonLd = Record<string, unknown>;

export function organisationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.origin,
    description: siteConfig.description,
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.origin,
    description: siteConfig.description,
    inLanguage: ["en", "bn"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.origin}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * The curriculum as a Course.
 *
 * No `educationalCredentialAwarded` and no accreditation claim — the
 * certificate says it isn't an accredited qualification, and the structured
 * data has to agree with the certificate.
 */
export function courseSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${siteConfig.name} — ${siteConfig.descriptor}`,
    description: siteConfig.description,
    url: `${siteConfig.origin}/learn`,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.origin,
    },
    isAccessibleForFree: true,
    inLanguage: "en",
  };
}

export function articleSchema({
  title,
  description,
  path,
  published,
  modified,
}: {
  title: string;
  description: string;
  path: string;
  published?: string;
  modified?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${siteConfig.origin}${path}`,
    inLanguage: "en",
    isAccessibleForFree: true,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
    // Only emitted when we have real dates. A made-up publish date is worse
    // than none — it's the field readers use to judge whether guidance is
    // still current.
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
  };
}

/** Built from the same crumb array the visual breadcrumb renders. */
export function breadcrumbSchema(items: Crumb[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteConfig.origin}${item.href}` } : {}),
    })),
  };
}

export function definedTermSchema({
  term,
  definition,
  path,
}: {
  term: string;
  definition: string;
  path: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term,
    description: definition,
    url: `${siteConfig.origin}${path}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: `${siteConfig.name} Glossary`,
      url: `${siteConfig.origin}/glossary`,
    },
  };
}
