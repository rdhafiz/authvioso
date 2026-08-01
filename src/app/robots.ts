import type { MetadataRoute } from "next";

import { noIndexRoutes } from "@/config/navigation";
import { siteConfig } from "@/config/site";

// The whole point is for this material to be findable, so the allow list is
// everything. The handful of disallowed paths are either useless to index
// (search results, local settings) or carry someone's name on them
// (certificate verification).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...noIndexRoutes],
      },
    ],
    sitemap: `${siteConfig.origin}/sitemap.xml`,
  };
}
