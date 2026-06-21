import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: `${backendUrl}/api/:path*`,
    },
  ],
};

export default nextConfig;
