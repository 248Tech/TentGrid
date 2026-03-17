import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@eventgrid/types"],
  typedRoutes: false,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        canvas: false,
      };
    }

    return config;
  },
};

export default nextConfig;
