/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    domains: [],
  },
  // Add TypeScript/ESLint build-time ignore rules
  typescript: {
    ignoreBuildErrors: true, // Equivalent to ignoreDuringBuilds
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 5,
  },
};

export default nextConfig;