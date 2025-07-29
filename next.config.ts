import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Optimize for production
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Environment variables
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
