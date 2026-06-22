import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/ai-hub",
  rewrites: async () => ({
    beforeFiles: [],
    afterFiles: [],
    fallback: [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
        basePath: false as const,
      },
    ],
  }),
};

export default nextConfig;
