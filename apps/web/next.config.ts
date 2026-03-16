import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@eventgrid/types"],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
