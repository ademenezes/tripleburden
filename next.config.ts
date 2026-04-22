import type { NextConfig } from "next";

// GitHub Pages project-site path. Set via env so local dev stays at root.
// Exposed as NEXT_PUBLIC_BASE_PATH so client-side fetches can prefix it.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // Ensure trailing slashes for static hosting (GitHub Pages serves
  // /dashboard/index.html, not /dashboard.html).
  trailingSlash: true,
  // next/image is not supported in static export without a loader.
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
