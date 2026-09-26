import type { NextConfig } from "next";

// Set by the GitHub Pages workflow ("/neuron"); empty for local dev.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Fully static site (GitHub Pages has no Node server).
  output: "export",
  basePath,
  trailingSlash: true,
  // Thumbnails are pre-optimized by scripts/thumbnails.mjs; no image server on Pages.
  images: { unoptimized: true },
  // A stray ~/package-lock.json otherwise makes Next infer the home dir as the workspace root.
  turbopack: { root: __dirname },
};

export default nextConfig;
