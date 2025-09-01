import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["picsum.photos"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3002",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3005",
        pathname: "/idrive-proxy/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/idrive-proxy/:path*",
        destination: "http://localhost:3005/idrive-proxy/:path*",
      },
    ];
  },
};

export default nextConfig;
