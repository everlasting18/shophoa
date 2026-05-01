import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rfmzqjlurgw0s6i.fbjc.pocketbasecloud.com",
        pathname: "/api/files/**",
      },
    ],
  },
};

export default nextConfig;
