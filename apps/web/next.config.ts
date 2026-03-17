import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@eventgrid/types"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(Array.isArray(config.externals) ? config.externals : []), "canvas"];
    }
    return config;
  },
};

export default nextConfig;
