import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  async rewrites() {
    const pages = ["certifications", "team", "projects/industrial", "projects/residential", "projects/commercial", "projects/infrastructure"];
    return {
      beforeFiles: [
        { source: "/", destination: "/index.html" },
        ...pages.map((p) => ({ source: `/${p}`, destination: `/${p}.html` })),
      ],
    };
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
