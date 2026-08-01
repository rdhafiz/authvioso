import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Kept minimal on purpose. This is a site people read, not an app we want
 * installed to a home screen, so there's no shell, no offline-first setup and
 * no install prompt to chase.
 *
 * No icons declared yet — there's no logo. Pointing at icon files that don't
 * exist would just produce 404s in the console on every page load.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.descriptor}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    orientation: "any",
    categories: ["education", "developer", "reference"],
    lang: "en",
    dir: "ltr",
  };
}
