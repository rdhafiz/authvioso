import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// Applied to everything. No CSP here yet — writing one before the asset graph
// settles means either breaking the site or shipping something so permissive
// it just looks like protection without being any. Add it once the fonts,
// styles and scripts are final.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // md/mdx need to be here or MDX files won't resolve as routes.
  pageExtensions: ["ts", "tsx", "md", "mdx"],

  poweredByHeader: false,

  // Published URLs are permanent, so pick one form and stick to it.
  trailingSlash: false,

  // Catches typo'd internal hrefs at build time. Worth the occasional
  // annoyance when a route is mid-rename.
  typedRoutes: true,

  images: {
    // Empty by design. We don't load images from anywhere else.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Plugins have to be named as strings rather than imported.
//
// Turbopack is the default bundler as of Next 16 and the plugin config gets
// handed across to Rust, which can't take a JS function. Options have to be
// serialisable too — anything clever needs the --webpack escape hatch.
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [
      "rehype-slug",
      [
        "rehype-autolink-headings",
        {
          behavior: "wrap",
          properties: { className: ["heading-anchor"] },
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
