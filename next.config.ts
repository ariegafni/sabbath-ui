import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const API_BASE_URL = isDev
  ? "http://localhost:3005"
  : process.env.NEXT_PUBLIC_API_BASE_URL;

const API_HOSTNAME = isDev
  ? "localhost"
  : new URL(process.env.NEXT_PUBLIC_API_BASE_URL || "").hostname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: isDev ? "http" : "https",
        hostname: API_HOSTNAME,
        port: isDev ? "3005" : "",
        pathname: "/idrive-proxy/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/idrive-proxy/:path*",
        destination: `${API_BASE_URL}/idrive-proxy/:path*`,
      },
    ];
  },
};

export default nextConfig;
