import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tipsly is highly interactive and reads the visitor's city from a cookie on
  // every request, so we render on demand and keep the classic App Router model.
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [{ source: "/konto", destination: "/konto/oversikt", permanent: false }];
  },
};

export default nextConfig;
