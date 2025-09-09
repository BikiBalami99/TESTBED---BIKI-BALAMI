import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // Ensure CSS properties are properly prefixed
    styledComponents: false,
  },
  // Remove webpack config since we're using Turbopack
  // PostCSS with autoprefixer will handle CSS prefixing
};

export default nextConfig;
