import type { NextConfig } from "next";
import withBundleAnalyzerInit from "@next/bundle-analyzer";
import withPWAInit from "@ducanh2912/next-pwa";

const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === "true",
});

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  },
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/share/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withPWA(nextConfig));
