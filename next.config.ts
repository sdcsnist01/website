import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ["*.trycloudflare.com"],
  experimental: {
    optimizePackageImports: ["motion"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/about/about.html",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/blog/blog.html",
        destination: "/blog",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
