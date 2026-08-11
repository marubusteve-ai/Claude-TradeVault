import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages (@trading-os/*) ship TypeScript source directly rather
  // than a prebuilt dist/ — Next transpiles them itself rather than requiring
  // each package to run its own build step before apps/web can start.
  transpilePackages: [
    "@trading-os/design-system",
    "@trading-os/shared-types",
    "@trading-os/domain",
    "@trading-os/analytics-engine",
    "@trading-os/application",
    "@trading-os/persistence-memory",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
