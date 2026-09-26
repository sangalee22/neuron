import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray ~/package-lock.json otherwise makes Next infer the home dir as the workspace root.
  turbopack: { root: __dirname },
};

export default nextConfig;
