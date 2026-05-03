import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/medusa/:path*',
        destination: `${process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
