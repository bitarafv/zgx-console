import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/simulation",
  experimental: { optimizePackageImports: ["lucide-react"] },
};

export default nextConfig;
