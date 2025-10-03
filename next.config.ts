import type { NextConfig } from "next";

const isElectron = process.env.ELECTRON === 'true';

const nextConfig: NextConfig = {
  output: isElectron ? 'export' : undefined,
  trailingSlash: isElectron ? true : false,
  images: {
    unoptimized: isElectron ? true : false,
  },
  distDir: isElectron ? 'out' : '.next',
  eslint: {
    // During Electron builds, ignore ESLint errors to allow build to complete
    ignoreDuringBuilds: isElectron,
  },
  async rewrites() {
    // Only use rewrites in web mode, not in Electron
    if (isElectron) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: 'https://speaknativeai-api-production.up.railway.app/api/:path*',
      },
    ]
  },
};

export default nextConfig;
