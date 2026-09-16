import type { NextConfig } from "next";

/**
 * Built as a fully static site so it can be served from GitHub Pages.
 *
 * A project page lives at `https://<user>.github.io/<repo>`, so every asset and
 * link needs that prefix in production. It stays empty for `next dev` and local
 * builds, where the site is served from the root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // GitHub Pages serves plain files, so there is no image optimiser to call.
  images: { unoptimized: true },
  // Emit `about/index.html` rather than `about.html`, which is what a static
  // file host expects to resolve from a trailing-slash URL.
  trailingSlash: true,
};

export default nextConfig;
