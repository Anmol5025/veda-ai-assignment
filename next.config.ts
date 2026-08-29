import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.module.rules.push({
      test: /pdf\.mjs$/,
      type: 'javascript/auto',
    });
    return config;
  },
  serverExternalPackages: ['canvas'],
};

export default nextConfig;
